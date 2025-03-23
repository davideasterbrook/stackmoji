interface SelectedEmojisProps {
  emojis: string[];
  onRemove: (index: number) => void;
}

export default function SelectedEmojis({ emojis, onRemove }: SelectedEmojisProps) {
  return (
    <div className="flex gap-2 mb-4 min-h-[60px] p-2 border rounded-lg">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onRemove(index)}
          className="text-2xl hover:opacity-75"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
} 