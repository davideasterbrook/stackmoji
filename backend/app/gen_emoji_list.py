# generate_emoji_list.py
import emoji
import json
from typing import List

def get_all_basic_emojis() -> List[str]:
    all_emojis = []
    excluded_terms = [
        "FRAME", "SUNRISE", "SUNSET", "MOON VIEWING", "CITYSCAPE",
        "SQUARE", "CIRCLE", "DIAMOND", "RECTANGLE",
        "BLACK SMALL", "WHITE SMALL",  # catches small geometric shapes
        "UP-POINTING RED TRIANGLE",    # we'll only keep the regular triangle
        "DOWN-POINTING RED TRIANGLE",
        "CLOCK FACE",                  # catches all clock faces (🕐, 🕑, etc.)
        "CLOCK",                        # catch any other clock variants
        "FIREWORK",
        "BUTTON",
        "BRIDGE", "X-RAY", "CINEMA", "ARROW",  # 🌉🩻🎦⬇
        "SYMBOL", "SIGN",                       # General symbols and signs
        "RESTROOM", "TOILET", "WASHROOM",      # 🚾 and similar
        "FOG", "FOGGY",                        # 🌫🌁
        "DAVID STAR", "HEXAGRAM",              # 🔯
        "SILHOUETTE", "GENDER",                # 🚺 and similar gender signs
        "DOWNWARDS", "UPWARDS",                # Direction arrows
        "LEFTWARDS", "RIGHTWARDS",             # Direction arrows
        "BATHROOM",                            # Additional bathroom-related
        "SIGNAGE",                             # Generic signage
        "WEATHER",                             # Weather-related scenes
        "SCENE",                               # Generic scenes
    ]
    
    seen_triangle = False  # To ensure we only keep one triangle variant
    
    for emoji_char, data in emoji.EMOJI_DATA.items():
        description = data['en'].upper()
        
        # Skip excluded terms
        if any(term in description for term in excluded_terms):
            continue
            
        # Handle triangles specially - only keep the first one we see
        if "TRIANGLE" in description:
            if seen_triangle:
                continue
            seen_triangle = True
            
        if (len(emoji_char) <= 2 and
            not any(ord(c) in [0x200D, 0xFE0F, 0xFE0E] or
                   0x1F3FB <= ord(c) <= 0x1F3FF or
                   0x1F1E6 <= ord(c) <= 0x1F1FF for c in emoji_char)):
            all_emojis.append(emoji_char)
    return all_emojis

if __name__ == "__main__":
    emojis = get_all_basic_emojis()
    with open('basic_emojis.json', 'w', encoding='utf-8') as f:
        json.dump(emojis, f, ensure_ascii=False)