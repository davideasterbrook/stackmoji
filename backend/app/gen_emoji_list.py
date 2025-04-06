# generate_emoji_list.py
import emoji
import json
from typing import List

def get_all_base_emojis() -> List[str]:
    all_emojis = [] 
    # Specific emojis to ban (you can add more here)
    banned_emojis = {
        "🪯", "🫏", "🫩", "🫨", "🪽", "🛜", "🫜", "🫜", "🪇", # Unicode 16.0 emojis
        "🪈", "🪭", "🫚", "🪮", "🪿", "🪉", "🪻", "🪼", "🪾", "🫷", "🫎", "🫛", "🩷", "🪏", "🫸", "🫟",
        '🆎', '🏧', "🛄", "🎦", "🧮", "📶", "📶", "💹", "🔯", "🛃", "🔃", "🎆", "🛗", "📳", "🚾", "🚺",
        "🚮", "🕎", "🚹", "🗾", "🖼", "💟", "🛐", "🚻", "🌠", "♿", "🩻", "🕉", "🏞", "🌃", "🛂", "🛅",
        "📴", "🌌", "🛂", "⚧"
        '♒', '♈', "♋", "♑", "♊", "♌", "♎", "♏", "♐", "♑", "♓", "♉", "♍", "♍","♒",
        "⛎", "⛎", "☪", "✡", "☸", "ℹ", "☯","⚛", "☣","✝","☮","☦",
        "🚼",
        "😠", "😧", "😲", "😖", "😕", "⚾", "🏀", "😡", "🥹", "😋", "😵", "🫤", "🤕", "😷", "🧐", "😮", "🤨", "🙄", "🤒", "😶", "🤬", "😶","😨","😬",
        "😦", "😀", "😃", "😄", "😆", "😗", "😚", "😙", "😭", "😔", "😣", "😊", "😎", "😍", "🙁", "🙂", "🙃", "😫", "😒", "😒", "😉", "😩", "🥴", "😟",
        "😞", "😑", "😯", "🤢", "😏", "😟", "😳", "😁", "🥸", "😐", "🤓", "😌", "🥲", "😢", "😅", "🫢", "☹",
        "🕦", "🕚", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧", "🕐",
        "🌝", "🏐", "🥎", "💿", "📀", "🪙", "☢", "Ⓜ", "©", "®", "🪩",
        "😺", "😽", "😾",
        "🟥",
        "🧔", "👱",
        "💽", "🎛", "🗄", "💾", "📰", "⌛", "🗓",
        "🥈", "🥉",
    }

    # Color variants to exclude (keep red versions)
    color_terms = [
        "GREEN", "BLUE", "PURPLE", "YELLOW", "ORANGE", "BROWN", "WHITE", "BLACK",
        "GREY", "GRAY"
    ]

    banned_terms = [
        "JAPANESE",
        "BUTTON",
        "CITYSCAPE",
        "BRIDGE",
        "INPUT",
        "CHART",
        "FOG",
        "NO_",
        "NON-",
        "KEYCAP",
        "SUNRISE",
        "SUNSET",
        "FACE_WITH_BAGS_UNDER_EYES",
        "FINGERPRINT",
        "GLOBE",
        "WANING",
        "WAXING",
        "SPARKLE",
        "MOON",
        "ARROW",
        "CLOCK",
        # "MOONRISE",
        # "MOONS",
        # "MOONSET",
        

    ]
    
    for emoji_char, data in emoji.EMOJI_DATA.items():
        description = data['en'].upper()
        

        # Skip specifically banned emojis
        if emoji_char in banned_emojis:
            continue
            
        # Skip color variants except red
        if any(color in description and "RED" not in description for color in color_terms):
            continue
            
        # Skip banned terms
        if any(term in description for term in banned_terms):
            continue
            
        # Skip excluded terms
        # if any(term in description for term in excluded_terms):
        #     continue
            
        # Handle triangles specially - only keep the first one we see
        # if "TRIANGLE" in description:
        #     if seen_triangle:
        #         continue
        #     seen_triangle = True
            
        if (len(emoji_char) <= 2 and
            not any(ord(c) in [0x200D, 0xFE0F, 0xFE0E] or
                   0x1F3FB <= ord(c) <= 0x1F3FF or
                   0x1F1E6 <= ord(c) <= 0x1F1FF for c in emoji_char)):
            all_emojis.append(emoji_char)
        
        # Debug print to see actual descriptions
        if emoji_char in ["🕓"]:
            print(f"{emoji_char}: {description}")

    return all_emojis

if __name__ == "__main__":
    emojis = get_all_base_emojis()
    with open('base_emojis.json', 'w', encoding='utf-8') as f:
        # Split emojis into chunks of 15
        chunks = [emojis[i:i + 15] for i in range(0, len(emojis), 15)]
        
        # Create formatted JSON string
        json_str = '[\n'
        for i, chunk in enumerate(chunks):
            json_str += '  ' + json.dumps(chunk, ensure_ascii=False)[1:-1]
            if i < len(chunks) - 1:
                json_str += ',\n'
            else:
                json_str += '\n'
        json_str += ']'
        
        f.write(json_str)
