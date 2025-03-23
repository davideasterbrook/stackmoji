import random
from typing import List, Tuple
import json
from datetime import datetime
import os

class EmojiManager:
    def __init__(self):
        self.emoji_pool = [
            "😀", "😂", "🤣", "😊", "🥰", "😎", "🤔", "🤯", "😴", "🥳",
            "🤠", "👻", "👽", "🤖", "🎃", "👾", "🤡", "🐶", "🐱", "🐭",
            "🐼", "🐸", "🦊", "🦁", "🐯", "🐮", "🐷", "🐵", "🦄", "🐲",
            "🌈", "⭐", "🌟", "✨", "💫", "☀️", "🌙", "⚡", "🔥", "💥"
        ]
        self.emoji_pool = [
            "🚳", "🚥", "🐶", "💎", "🥲",
            "🌞", "🫤", "💟", "🥮", "🫡",
            "🌇", "🅿", "🍮", "🌻", "🧷",
            "🍴", "🪪", "🌩", "5⃣", "✈",
            "🎴", "🌄", "☪", "🥝", "😼"
        ]
        self.data_file = "daily_game.json"
        self.data_path = os.path.join(os.path.dirname(__file__), "data", self.data_file)

    def _ensure_data_directory(self):
        """Ensure the data directory exists"""
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)

    def _get_current_date(self) -> str:
        """Get current date in YYYY-MM-DD format"""
        return datetime.now().strftime("%Y-%m-%d")

    def _load_current_game(self) -> dict:
        """Load the current game data from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                return data
        except (FileNotFoundError, json.JSONDecodeError):
            return {"date": "", "options": [], "answer": []}

    def _save_game(self, game_data: dict):
        """Save the game data to file"""
        self._ensure_data_directory()
        with open(self.data_path, 'w') as f:
            json.dump(game_data, f)

    def _generate_daily_game(self) -> Tuple[List[str], List[str]]:
        """Generate a new set of emojis for the day"""
        # Shuffle the emoji pool and select 25 for options
        daily_options = random.sample(self.emoji_pool, 25)
        
        # Select 2-4 emojis from the options for the answer
        answer_count = random.randint(2, 4)
        daily_answer = random.sample(daily_options, answer_count)
        
        return daily_options, daily_answer

    def get_daily_game(self) -> Tuple[List[str], List[str]]:
        """Get the daily game, generating a new one if needed"""
        current_date = self._get_current_date()
        current_game = self._load_current_game()

        # If the saved game is from a different date, generate a new one
        if current_game["date"] != current_date:
            options, answer = self._generate_daily_game()
            game_data = {
                "date": current_date,
                "options": options,
                "answer": answer
            }
            self._save_game(game_data)
            return options, answer

        return current_game["options"], current_game["answer"]

    def update_emoji_pool(self, new_emojis: List[str]):
        """Update the emoji pool with new emojis"""
        if len(new_emojis) < 25:  # Ensure we have enough emojis for daily selection
            raise ValueError("Emoji pool must contain at least 25 emojis")
        self.emoji_pool = new_emojis 