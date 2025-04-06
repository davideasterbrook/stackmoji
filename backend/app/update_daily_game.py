import random
import os
from typing import List
from aws_lambda_powertools import Logger
import json
import boto3

logger = Logger()

# Load pre-computed emoji list
with open('base_emojis.json', 'r', encoding='utf-8') as f:
    EMOJIS = json.load(f)


def select_daily_emojis(count: int = 25) -> List[str]:
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
    daily_options = select_daily_emojis(25)

    # Select 3-4 emojis from the options for the answer
    answer_count = random.randint(3, 4)
    daily_answer = random.sample(daily_options, answer_count)

    return {
        "options": daily_options,
        "answer": daily_answer
    }


def lambda_handler(event, context):
    logger.info(f"{event=}")
    new_game = generate_daily_game()

    logger.debug(f"{new_game=}")

    s3_client = boto3.client('s3')
    s3_client.put_object(
        Bucket=os.environ['BUCKET_NAME'],
        Key='daily-game.json',
        Body=json.dumps(new_game)
    )

    return {
        'statusCode': 200,
        'body': 'Successfully updated daily game'
    }
