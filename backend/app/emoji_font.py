from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont


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
