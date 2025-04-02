import random
import os
from typing import List, Dict
import unicodedata
from aws_lambda_powertools import Logger
import json
import boto3

logger = Logger()

# Load pre-computed emoji list
with open('basic_emojis.json', 'r', encoding='utf-8') as f:
    BASIC_EMOJIS = json.load(f)

def get_all_basic_emojis() -> List[str]:
    """
    Return the pre-computed list of basic emojis.
    """
    return BASIC_EMOJIS

def categorize_emojis(emojis: List[str]) -> Dict[str, List[str]]:
    """
    Categorize emojis by their Unicode category/block.
    This will help us ensure we get a good mix of different types.
    """
    categories = {}
    for emoji_char in emojis:
        try:
            # Get the Unicode name of the emoji
            name = unicodedata.name(emoji_char[0]).split()[0]
            if name not in categories:
                categories[name] = []
            categories[name].append(emoji_char)
        except ValueError:
            continue
    return categories

def select_daily_emojis(count: int = 25) -> List[str]:
    """
    Select a diverse set of emojis for the daily game.
    """
    all_emojis = get_all_basic_emojis()
    categories = categorize_emojis(all_emojis)
    
    # # Print category statistics for debugging
    # print("Available emoji categories:")
    # for category, emojis in categories.items():
    #     print(f"{category}: {len(emojis)} emojis")
    
    selected_emojis = []
    
    # Try to get emojis from different categories
    main_categories = [
        'SMILING', 'FACE', 'CAT', 'DOG', 'HEART',
        'STAR', 'SUN', 'MOON', 'CLOUD', 'FLOWER',
        'FRUIT', 'ANIMAL'
    ]
    
    # First, try to get some emojis from main categories
    for category in main_categories:
        matching_categories = [
            cat for cat in categories.keys() 
            if category in cat
        ]
        for cat in matching_categories:
            if len(categories[cat]) > 0 and len(selected_emojis) < count:
                emoji_choice = random.choice(categories[cat])
                selected_emojis.append(emoji_choice)
                categories[cat].remove(emoji_choice)
    
    # Fill the rest with random emojis from any category
    remaining_emojis = [
        e for cat in categories.values() 
        for e in cat
    ]
    
    while len(selected_emojis) < count and remaining_emojis:
        emoji_choice = random.choice(remaining_emojis)
        selected_emojis.append(emoji_choice)
        remaining_emojis.remove(emoji_choice)
    
    # Shuffle the final selection
    random.shuffle(selected_emojis)
    
    return selected_emojis[:count]

def generate_daily_game():
    """
    Generate the daily game with options and answer.
    """
    daily_options = select_daily_emojis(25)
    
    # Select 2-4 emojis from the options for the answer
    answer_count = random.randint(3, 4)
    daily_answer = random.sample(daily_options, answer_count)
    
    return {
        "options": daily_options,
        "answer": daily_answer
    }

def lambda_handler(event, context):
    logger.info(f"{event=}")
    try:
        # Check if the event is from EventBridge (scheduled event)
        if 'source' in event and event['source'] == 'aws.events':
            # Generate and store new daily game
            new_game = generate_daily_game()
            
            ssm = boto3.client('ssm')
            ssm.put_parameter(
                Name='/emoji-shadows/daily-options',
                Value=json.dumps(new_game['options']),
                Type='String',
                Overwrite=True
            )
            
            ssm.put_parameter(
                Name='/emoji-shadows/daily-answer',
                Value=json.dumps(new_game['answer']),
                Type='String',
                Overwrite=True
            )

            s3_client = boto3.client('s3')
            s3_client.put_object(
                Bucket=os.environ['BUCKET_NAME'],
                Key='daily-game.json',
                Body=json.dumps({
                    'options': new_game['options'],
                    'answer': new_game['answer']
                })
            )
            
            return {
                'statusCode': 200,
                'body': 'Successfully updated daily game'
            }
        
        # Default behavior: return current SSM parameters
        ssm = boto3.client('ssm')
        try:
            options = ssm.get_parameter(Name='/emoji-shadows/daily-options')['Parameter']['Value']
            answer = ssm.get_parameter(Name='/emoji-shadows/daily-answer')['Parameter']['Value']



            return {
                'statusCode': 200,
                'body': json.dumps({
                    'options': json.loads(options),
                    'answer': json.loads(answer)
                })
            }
        except ssm.exceptions.ParameterNotFound:
            return {
                'statusCode': 404,
                'body': 'Daily game not found'
            }
            
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': f'Error updating daily game: {str(e)}'
        }
