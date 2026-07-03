import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { timeAgo } from "../../lib/utils";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  team_size: string;
  current_tools: string;
  persona_type: string;
  temperature: string;
  message_count: number;
  created_at: string;
}

const personaLabel: Record<string, string> = {
  operator: "Operator",
  builder: "Builder",
  deliverer: "Deliverer",
};

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setLeads(data as Lead[]);
        setLoading(false);
      });
  }, []);

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Team size",
      "Current tools",
      "Persona",
      "Temperature",
      "Messages",
      "When",
    ];
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.phone || "",
      l.team_size || "",
      l.current_tools || "",
      personaLabel[l.persona_type] || l.persona_type || "",
      l.temperature,
      String(l.message_count || 0),
      timeAgo(l.created_at),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ybs-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ color: "var(--mist)" }}>Loading leads…</div>;

  return (
    <div className="full-panel">
      <div className="panel-t">
        All leads <span>{leads.length} total</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="export-b" onClick={exportCsv}>
          <i className="ti ti-download" aria-hidden="true" /> Export CSV
        </button>
      </div>
      <div className="leads-table-wrap">
        <table className="leads-t">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Persona</th>
              <th>Team size</th>
              <th>Current tools</th>
              <th>Temp</th>
              <th>Msgs</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="nm">{l.name}</td>
                <td>{l.email}</td>
                <td>{l.phone || "—"}</td>
                <td>
                  <span className="p-tag">
                    {personaLabel[l.persona_type] || l.persona_type || "—"}
                  </span>
                </td>
                <td>{l.team_size || "—"}</td>
                <td>{l.current_tools || "—"}</td>
                <td>
                  <span className={`temp ${l.temperature}`}>{l.temperature}</span>
                </td>
                <td>{l.message_count || 0}</td>
                <td>{timeAgo(l.created_at)}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} style={{ color: "var(--mist)", fontSize: 12, padding: 10 }}>
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
