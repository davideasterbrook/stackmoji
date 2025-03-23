interface EmojiGridProps {
  emojis: string[];
  onSelect: (emoji: string) => void;
}

export default function EmojiGrid({ emojis, onSelect }: EmojiGridProps) {
  if (!emojis) return null;
  
  return (
    <div className="grid grid-cols-5 gap-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="p-4 text-4xl bg-white rounded-lg shadow hover:bg-gray-50"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
} 