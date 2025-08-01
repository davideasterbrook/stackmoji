import random
import os
import time
from typing import List
from aws_lambda_powertools import Logger
import json
import boto3
from emoji_font import EmojiFont

logger = Logger()

# Load pre-computed emoji list
with open('base_emojis.json', 'r', encoding='utf-8') as f:
    EMOJIS = json.load(f)


def select_emojis(count: int = 25) -> List[str]:
    """
    Select a diverse set of emojis for the daily game.
    """
    selected_emojis = []

    # Get random sample of count emojis from the EMOJIS list
    selected_emojis = random.sample(EMOJIS, count)

    # Shuffle the final selection
    random.shuffle(selected_emojis)

    return selected_emojis[:count]


def generate_daily_game():
    """
    Generate the daily game with options and answer.
    """
    daily_emojis = select_emojis(25)

    # Currently defaulting to 4 emojis for the answer
    answer_count = random.randint(4, 4)
    daily_answer = random.sample(daily_emojis, answer_count)

    return {
        "emojis": daily_emojis,
        "answer": daily_answer
    }


def lambda_handler(event, context):
    logger.info(f"{event=}")
    new_game_data = generate_daily_game()
    emoji_font = EmojiFont("NotoColorEmoji-Regular.ttf")
    emoji_font.gen_subset(new_game_data['emojis'], "/tmp/NotoColorEmoji-Stackmoji-Subset.ttf")

    logger.debug(f"{new_game_data=}")

    s3_client = boto3.client('s3')

    # Upload to frontend bucket (for CloudFront optimization)
    frontend_bucket = os.environ.get('FRONTEND_BUCKET_NAME')
    if frontend_bucket:
        logger.info(f"Also uploading to frontend bucket: {frontend_bucket}")
        s3_client.put_object(
            Bucket=frontend_bucket,
            Key='stackmoji-game-data.json',
            Body=json.dumps(new_game_data)
        )
        s3_client.upload_file(
            Filename='/tmp/NotoColorEmoji-Stackmoji-Subset.ttf',
            Bucket=frontend_bucket,
            Key='NotoColorEmoji-Stackmoji-Subset.ttf'
        )

        # Invalidate CloudFront cache for these files
        distribution_id = os.environ.get('CLOUDFRONT_DISTRIBUTION_ID')
        if distribution_id:
            logger.info(f"Invalidating CloudFront cache for distribution: {distribution_id}")
            cloudfront_client = boto3.client('cloudfront')
            try:
                response = cloudfront_client.create_invalidation(
                    DistributionId=distribution_id,
                    InvalidationBatch={
                        'Paths': {
                            'Quantity': 2,
                            'Items': [
                                '/stackmoji-game-data.json',
                                '/NotoColorEmoji-Stackmoji-Subset.ttf'
                            ]
                        },
                        'CallerReference': str(int(time.time()))
                    }
                )
                logger.info(f"CloudFront invalidation created: {response['Invalidation']['Id']}")
            except Exception as e:
                logger.error(f"Failed to create CloudFront invalidation: {e}")

    return {
        'statusCode': 200,
        'body': 'Successfully updated daily game'
    }
