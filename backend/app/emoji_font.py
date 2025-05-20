import os
from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_emojis():
    """Load the list of emojis from base_emojis.json"""
    with open('base_emojis.json', 'r', encoding='utf-8') as f:
        return json.load(f)

class EmojiFont:
    def __init__(self, font_path: str):
        self.font_path = font_path
        self.font = TTFont(self.font_path)
        self.subsetter = Subsetter()

    def gen_subset(self, emojis, output_path: str):
        unicodes = []
        for emoji in emojis:
            for char in emoji:
                unicodes.append(ord(char))
        self.subsetter.populate(unicodes=unicodes)
        self.subsetter.subset(self.font)
        self.font.save(output_path)


if __name__ == "__main__":
    emoji_font = EmojiFont("NotoColorEmoji-Regular.ttf")
    emojis = load_emojis()
    emoji_font.gen_subset(emojis[:25], "NotoColorEmoji-Subset.ttf")
