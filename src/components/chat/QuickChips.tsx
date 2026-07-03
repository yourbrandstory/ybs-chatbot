interface Props {
  chips: string[];
  onSelect: (text: string) => void;
}

export default function QuickChips({ chips, onSelect }: Props) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="chips-row">
      {chips.map((chip, i) => (
        <button
          key={i}
          className="q-chip"
          onClick={() => onSelect(chip)}
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
