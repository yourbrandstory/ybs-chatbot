import { useState } from "react";

interface Props {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    team_size: string;
    current_tools: string;
  }) => void;
}

export default function LeadFormCard({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [currentTools, setCurrentTools] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  if (done) {
    return (
      <div className="lead-form">
        <h4 style={{ color: "var(--sage)" }}>You're confirmed.</h4>
        <p>We'll reach out within 24 hours to confirm your walkthrough time.</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      setErr("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErr("Please enter a valid email.");
      return;
    }
    setErr("");
    setDone(true);
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      team_size: teamSize,
      current_tools: currentTools,
    });
  }

  return (
    <div className="lead-form">
      <h4>Book your walkthrough</h4>
      <p>2 minutes to fill, 20 minutes to change how your team works.</p>
      <div className="form-fields">
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
          <option value="">Team size</option>
          <option value="1-3">1–3 people</option>
          <option value="3-8">3–8 people</option>
          <option value="8-15">8–15 people</option>
          <option value="15+">15+ people</option>
        </select>
        <input
          type="text"
          placeholder="Current tools (e.g. Notion, Sheets)"
          value={currentTools}
          onChange={(e) => setCurrentTools(e.target.value)}
        />
        {err && <div style={{ color: "var(--rust)", fontSize: 11 }}>{err}</div>}
        <button className="submit-b" onClick={handleSubmit}>
          Book my walkthrough →
        </button>
      </div>
    </div>
  );
}
