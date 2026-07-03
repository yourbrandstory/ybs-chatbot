import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { timeAgo } from "../../lib/utils";

interface ConvRow {
  id: string;
  session_id: string;
  persona_type: string;
  message_count: number;
  temperature: string;
  lead_captured: boolean;
  started_at: string;
  last_message_at: string;
  preview?: string;
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  persona_type: string;
  temperature: string;
  message_count: number;
  created_at: string;
}

interface Props {
  onOpenConversation: (id: string) => void;
}

const personaLabel: Record<string, string> = {
  operator: "Operator",
  builder: "Builder",
  deliverer: "Deliverer",
  unknown: "—",
};

export default function DashboardView({ onOpenConversation }: Props) {
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [messages, setMessages] = useState<{ content: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(50);

      const { data: lds } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: msgs } = await supabase.from("messages").select("content").eq("role", "user");

      if (convs) setConversations(convs as ConvRow[]);
      if (lds) setLeads(lds as LeadRow[]);
      if (msgs) setMessages(msgs);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="admin-wrap" style={{ color: "var(--mist)" }}>
        Loading dashboard…
      </div>
    );

  const lastWeek = Date.now() - 7 * 86400000;
  const recentConvs = conversations.filter((c) => new Date(c.last_message_at).getTime() > lastWeek);
  const recentLeads = leads.filter((l) => new Date(l.created_at).getTime() > lastWeek);
  const hotLeads = leads.filter((l) => l.temperature === "hot").length;
  const avgMsgs =
    conversations.length > 0
      ? (conversations.reduce((s, c) => s + c.message_count, 0) / conversations.length).toFixed(1)
      : "0";

  // Top queries
  const clusters: Record<string, string[]> = {
    pricing: ["cost", "price", "pricing", "how much"],
    demo: ["demo", "walkthrough", "see it", "show me"],
    task: ["task", "assign", "assignment"],
    team: ["team size", "how many", "people"],
    feature: ["milestone", "calendar", "track"],
  };
  const counts: Record<string, number> = {};
  for (const [key, keywords] of Object.entries(clusters)) {
    counts[key] = messages.filter((m) =>
      keywords.some((kw) => m.content.toLowerCase().includes(kw)),
    ).length;
  }
  const maxCount = Math.max(...Object.values(counts), 1);
  const topQueries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({
      text: key.charAt(0).toUpperCase() + key.slice(1),
      count,
      pct: Math.round((count / maxCount) * 100),
    }));

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="stat-l">Conversations (7d)</div>
          <div className="stat-v">{recentConvs.length}</div>
          <div className="stat-s">{conversations.length} total</div>
        </div>
        <div className="stat">
          <div className="stat-l">Leads captured (7d)</div>
          <div className="stat-v">{recentLeads.length}</div>
          <div className="stat-s green">{leads.length} total</div>
        </div>
        <div className="stat">
          <div className="stat-l">Hot leads</div>
          <div className="stat-v">{hotLeads}</div>
          <div className="stat-s amber">Follow up today</div>
        </div>
        <div className="stat">
          <div className="stat-l">Avg messages</div>
          <div className="stat-v">{avgMsgs}</div>
          <div className="stat-s">Per conversation</div>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-t">
            Recent conversations <span>Live</span>
          </div>
          {conversations.slice(0, 10).map((c) => (
            <button key={c.id} className="conv" onClick={() => onOpenConversation(c.id)}>
              <div className="conv-av">{c.session_id[0]?.toUpperCase() || "?"}</div>
              <div className="conv-mid">
                <div className="conv-name">
                  {c.persona_type !== "unknown"
                    ? personaLabel[c.persona_type] || c.persona_type
                    : "Visitor"}
                </div>
                <div className="conv-preview">{c.message_count} messages</div>
              </div>
              <div className="conv-right">
                <span className={`temp ${c.temperature}`}>{c.temperature}</span>
                <span className="conv-time">{timeAgo(c.last_message_at)}</span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p style={{ color: "var(--mist)", fontSize: 12 }}>No conversations yet.</p>
          )}
        </div>

        <div className="panel">
          <div className="panel-t">
            Top queries <span>All time</span>
          </div>
          {topQueries.map((q, i) => (
            <div className="q-item" key={q.text}>
              <div className="q-rank">{i + 1}</div>
              <div className="q-text">{q.text}</div>
              <div className="q-bar-w">
                <div className="q-bar" style={{ width: `${q.pct}%` }} />
              </div>
              <div className="q-n">{q.count}</div>
            </div>
          ))}
          {topQueries.length === 0 && (
            <p style={{ color: "var(--mist)", fontSize: 12 }}>No messages yet.</p>
          )}
        </div>
      </div>

      <div className="full-panel">
        <div className="panel-t">
          Leads captured <span>Name · contact · persona · temperature</span>
        </div>
        <table className="leads-t">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Persona</th>
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
                <td>
                  <span className="p-tag">{personaLabel[l.persona_type] || l.persona_type}</span>
                </td>
                <td>
                  <span className={`temp ${l.temperature}`}>{l.temperature}</span>
                </td>
                <td>{l.message_count || 0}</td>
                <td>{timeAgo(l.created_at)}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--mist)", fontSize: 12, padding: 10 }}>
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
