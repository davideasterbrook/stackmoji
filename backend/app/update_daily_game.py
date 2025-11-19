import random
import os
import time
from aws_lambda_powertools import Logger
from typing import List, Dict, Any
import json
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from emoji_font import EmojiFont

# Initialize logger
logger = Logger()

# Constants
DEFAULT_EMOJI_COUNT = 25
DEFAULT_ANSWER_COUNT = 4
MAX_EMOJI_COUNT = 50
MIN_EMOJI_COUNT = 10
FONT_PATH = "NotoColorEmoji-Regular.ttf"
FONT_OUTPUT_PATH = "/tmp/NotoColorEmoji-Stackmoji-Subset.ttf"

# Load pre-computed emoji list with error handling
try:
    with open('base_emojis.json', 'r', encoding='utf-8') as f:
        EMOJIS = json.load(f)

    if not isinstance(EMOJIS, list) or len(EMOJIS) < MIN_EMOJI_COUNT:
        raise ValueError(f"Invalid emoji data: expected list with at least {MIN_EMOJI_COUNT} emojis")

    logger.info(f"Loaded {len(EMOJIS)} emojis from base_emojis.json")
except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
    logger.error(f"Critical error loading emoji data: {e}")
    raise


def validate_emoji_count(count: int) -> int:
    """Validate and sanitize emoji count parameter."""
    if not isinstance(count, int):
        logger.warning(f"Invalid emoji count type: {type(count)}, using default")
        return DEFAULT_EMOJI_COUNT

    if count < MIN_EMOJI_COUNT:
        logger.warning(f"Emoji count {count} too low, using minimum {MIN_EMOJI_COUNT}")
        return MIN_EMOJI_COUNT

    if count > MAX_EMOJI_COUNT:
        logger.warning(f"Emoji count {count} too high, using maximum {MAX_EMOJI_COUNT}")
        return MAX_EMOJI_COUNT

    if count > len(EMOJIS):
        logger.warning(f"Emoji count {count} exceeds available emojis {len(EMOJIS)}")
        return len(EMOJIS)

    return count


def select_emojis(count: int = DEFAULT_EMOJI_COUNT) -> List[str]:
    """
    Select a diverse set of emojis for the daily game.

    Args:
        count: Number of emojis to select

    Returns:
        List of selected emoji strings

    Raises:
        ValueError: If count is invalid or insufficient emojis available
    """
    validated_count = validate_emoji_count(count)

    try:
        # Get random sample of emojis from the EMOJIS list
        selected_emojis = random.sample(EMOJIS, validated_count)

        # Shuffle the final selection for extra randomness
        random.shuffle(selected_emojis)

        logger.info(f"Successfully selected {len(selected_emojis)} emojis")
        return selected_emojis

    except ValueError as e:
        logger.error(f"Error selecting emojis: {e}")
        raise


def generate_daily_game(emoji_count: int = DEFAULT_EMOJI_COUNT, answer_count: int = DEFAULT_ANSWER_COUNT) -> Dict[str, Any]:
    """
    Generate the daily game with options and answer.

    Args:
        emoji_count: Number of emoji options to provide
        answer_count: Number of emojis in the answer

    Returns:
        Dictionary containing game data

    Raises:
        ValueError: If parameters are invalid
    """
    try:
        # Validate answer count
        if answer_count < 1 or answer_count > emoji_count:
            logger.warning(f"Invalid answer count {answer_count}, using default {DEFAULT_ANSWER_COUNT}")
            answer_count = DEFAULT_ANSWER_COUNT

        # Select emojis for the game
        daily_emojis = select_emojis(emoji_count)

        # Select answer emojis from the available options
        daily_answer = random.sample(daily_emojis, answer_count)

        game_data = {
            "emojis": daily_emojis,
            "answer": daily_answer,
            "required_count": len(daily_answer),
            "generated_at": int(time.time())
        }

        logger.info(f"Generated daily game with {len(daily_emojis)} emojis and {len(daily_answer)} answers")
        return game_data

    except Exception as e:
        logger.error(f"Error generating daily game: {e}")
        raise


def upload_to_s3(s3_client, bucket_name: str, key: str, data: Any, content_type: str = 'application/json') -> bool:
    """
    Upload data to S3 with error handling.

    Args:
        s3_client: Boto3 S3 client
        bucket_name: S3 bucket name
        key: S3 object key
        data: Data to upload
        content_type: Content type for the object

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if isinstance(data, (dict, list)):
            body = json.dumps(data, ensure_ascii=False)
        else:
            body = data

        s3_client.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=body,
            ContentType=content_type,
            CacheControl='max-age=0, no-cache, no-store, must-revalidate'
        )

        logger.info(f"Successfully uploaded {key} to {bucket_name}")
        return True

    except (ClientError, BotoCoreError) as e:
        logger.error(f"AWS error uploading {key} to {bucket_name}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error uploading {key} to {bucket_name}: {e}")
        return False


def upload_file_to_s3(s3_client, bucket_name: str, file_path: str, key: str, content_type: str = 'font/ttf') -> bool:
    """
    Upload file to S3 with error handling.

    Args:
        s3_client: Boto3 S3 client
        bucket_name: S3 bucket name
        file_path: Local file path
        key: S3 object key
        content_type: Content type for the object

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return False

        s3_client.upload_file(
            Filename=file_path,
            Bucket=bucket_name,
            Key=key,
            ExtraArgs={
                'ContentType': content_type,
                'CacheControl': 'max-age=86400'  # Cache font files for 1 day
            }
        )

        logger.info(f"Successfully uploaded file {file_path} to {bucket_name}/{key}")
        return True

    except (ClientError, BotoCoreError) as e:
        logger.error(f"AWS error uploading file {file_path} to {bucket_name}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error uploading file {file_path} to {bucket_name}: {e}")
        return False


def invalidate_cloudfront_cache(distribution_id: str, paths: List[str]) -> bool:
    """
    Invalidate CloudFront cache with error handling.

    Args:
        distribution_id: CloudFront distribution ID
        paths: List of paths to invalidate

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        cloudfront_client = boto3.client('cloudfront')

        response = cloudfront_client.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': len(paths),
                    'Items': paths
                },
                'CallerReference': f"daily-game-{int(time.time())}"
            }
        )

        invalidation_id = response['Invalidation']['Id']
        logger.info(f"CloudFront invalidation created: {invalidation_id}")
        return True

    except (ClientError, BotoCoreError) as e:
        logger.error(f"AWS error creating CloudFront invalidation: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error creating CloudFront invalidation: {e}")
        return False


def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    AWS Lambda handler for updating daily game data.

    Args:
        event: Lambda event data
        context: Lambda context

    Returns:
        Dict containing status code and response body
    """
    try:
        logger.info("Starting daily game update", extra={"event": event})

        # Generate new game data
        new_game_data = generate_daily_game()
        logger.debug("Generated game data", extra={"game_data": new_game_data})

        # Generate font subset
        try:
            emoji_font = EmojiFont(FONT_PATH)
            emoji_font.gen_subset(new_game_data['emojis'], FONT_OUTPUT_PATH)
            logger.info("Successfully generated font subset")
        except Exception as e:
            logger.error(f"Error generating font subset: {e}")
            # Continue execution - font generation failure shouldn't break the game

        # Initialize S3 client
        try:
            s3_client = boto3.client('s3')
        except Exception as e:
            logger.error(f"Failed to create S3 client: {e}")
            return {
                'statusCode': 500,
                'body': 'Failed to initialize S3 client'
            }

        # Upload to frontend bucket
        frontend_bucket = os.environ.get('FRONTEND_BUCKET_NAME')
        if not frontend_bucket:
            logger.error("FRONTEND_BUCKET_NAME environment variable not set")
            return {
                'statusCode': 500,
                'body': 'Frontend bucket not configured'
            }

        logger.info(f"Uploading to frontend bucket: {frontend_bucket}")

        # Upload game data
        game_data_success = upload_to_s3(
            s3_client, 
            frontend_bucket, 
            'stackmoji-game-data.json', 
            new_game_data,
            'application/json'
        )

        # Upload font file (if it exists)
        font_success = True
        if os.path.exists(FONT_OUTPUT_PATH):
            font_success = upload_file_to_s3(
                s3_client,
                frontend_bucket,
                FONT_OUTPUT_PATH,
                'NotoColorEmoji-Stackmoji-Subset.ttf',
                'font/ttf'
            )
        else:
            logger.warning("Font subset file not found, skipping font upload")

        # Check if uploads were successful
        if not game_data_success:
            logger.error("Failed to upload game data")
            return {
                'statusCode': 500,
                'body': 'Failed to upload game data'
            }

        # Invalidate CloudFront cache
        distribution_id = os.environ.get('CLOUDFRONT_DISTRIBUTION_ID')
        if distribution_id:
            invalidation_paths = ['/stackmoji-game-data.json']
            if font_success:
                invalidation_paths.append('/NotoColorEmoji-Stackmoji-Subset.ttf')

            invalidation_success = invalidate_cloudfront_cache(distribution_id, invalidation_paths)
            if not invalidation_success:
                logger.warning("CloudFront cache invalidation failed, but continuing")
        else:
            logger.warning("CLOUDFRONT_DISTRIBUTION_ID not set, skipping cache invalidation")

        logger.info("Successfully completed daily game update")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Successfully updated daily game',
                'emoji_count': len(new_game_data['emojis']),
                'answer_count': len(new_game_data['answer']),
                'timestamp': new_game_data['generated_at']
            })
        }

    except Exception as e:
        logger.error(f"Critical error in lambda handler: {e}", exc_info=True)

        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Internal server error',
                'error': str(e) if os.environ.get('DEBUG') == 'true' else 'Internal error'
            })
        }
