interface Props {
  onSelect: (persona: string) => void;
  disabled?: boolean;
}

const personas = [
  {
    id: "operator",
    icon: "ti ti-bolt",
    role: "The Operator",
    name: "Operations lead",
    desc: "Campaigns, client work, internal projects — simultaneously. 3–8 people.",
  },
  {
    id: "builder",
    icon: "ti ti-rocket",
    role: "The Builder",
    name: "Growth lead",
    desc: "Team doubled in 6 months. Old systems don't scale. 8–15 people.",
  },
  {
    id: "deliverer",
    icon: "ti ti-target",
    role: "The Deliverer",
    name: "Service lead",
    desc: "Client commitments, deadlines, recurring work across people.",
  },
];

export default function PersonaCards({ onSelect, disabled }: Props) {
  return (
    <div className="persona-row">
      {personas.map((p) => (
        <button key={p.id} className="p-card" onClick={() => onSelect(p.id)} disabled={disabled}>
          <div className="p-icon">
            <i className={p.icon} aria-hidden="true" />
          </div>
          <div className="p-body">
            <div className="p-role">{p.role}</div>
            <div className="p-name">{p.name}</div>
            <div className="p-desc">{p.desc}</div>
          </div>
          <span className="p-card-arrow">→</span>
        </button>
      ))}
    </div>
  );
}
