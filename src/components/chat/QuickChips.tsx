export interface ChipItem {
  text: string;
  category?: "pain" | "team" | "disco";
}

interface Props {
  chips: ChipItem[];
  onSelect: (text: string) => void;
  showLabel?: boolean;
}

const dotColors: Record<string, string> = {
  pain: "#C0532A",
  team: "#6B3A8A",
  disco: "#B8860B",
};

export default function QuickChips({ chips, onSelect, inputFocused, showLabel }: Props) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="chips-section">
      {showLabel && <div className="chips-label">Quick replies</div>}
      <div className="chips-row">
        {chips.map((chip, i) => (
          <button
            key={i}
            className="q-chip"
            onClick={() => onSelect(chip.text)}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {chip.category && (
              <span className="chip-dot" style={{ backgroundColor: dotColors[chip.category] }} />
            )}
            {chip.text}
          </button>
        ))}
      </div>
    </div>
  );
}
