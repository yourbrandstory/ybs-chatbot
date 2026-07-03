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
  const [messages, setMessages] = useState<{ id: string; content: string }[]>([]);
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

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, content")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(50);

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

  // Query categorization
  type QueryCategory =
    | "Task system"
    | "Client tracking"
    | "Milestones"
    | "SM Calendar"
    | "Pricing"
    | "Demo request"
    | "Team setup"
    | "General";

  const categoryInfo: Record<QueryCategory, { keywords: string[]; cls: string; color: string }> = {
    "Task system": {
      keywords: ["task", "assign", "assignment", "dashboard", "column", "priority"],
      cls: "task",
      color: "#3B1F4E",
    },
    "Client tracking": {
      keywords: ["client", "customer", "account", "tracking"],
      cls: "client",
      color: "#2563EB",
    },
    Milestones: {
      keywords: ["milestone", "goal", "progress", "completion"],
      cls: "milestone",
      color: "#16A34A",
    },
    "SM Calendar": {
      keywords: ["social media", "calendar", "content", "posting", "schedule"],
      cls: "sm-cal",
      color: "#B8860B",
    },
    Pricing: {
      keywords: ["cost", "price", "pricing", "how much", "budget", "plan", "pay"],
      cls: "pricing",
      color: "#C2410C",
    },
    "Demo request": {
      keywords: ["demo", "walkthrough", "see it", "show me", "book", "tour"],
      cls: "demo",
      color: "#7C3AED",
    },
    "Team setup": {
      keywords: ["team size", "how many", "people", "onboarding", "setup", "growing"],
      cls: "team",
      color: "#0891B2",
    },
    General: { keywords: [], cls: "general", color: "#6B7280" },
  };

  function categorize(text: string): QueryCategory {
    const lower = text.toLowerCase();
    for (const [cat, info] of Object.entries(categoryInfo) as [
      QueryCategory,
      (typeof categoryInfo)["Task system"],
    ][]) {
      if (cat === "General") continue;
      if (info.keywords.some((kw) => lower.includes(kw))) return cat;
    }
    return "General";
  }

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
            What people are asking about TeamMap
            <span>Use this data to improve the system prompt</span>
          </div>

          <div className="q-callout">
            <i className="ti ti-bulb" />
            <div>
              <strong>Real visitor questions</strong> — these are actual questions visitors are
              asking the chatbot. Review them regularly and update the system prompt in{" "}
              <strong>Settings</strong> to improve accuracy and relevance.
            </div>
          </div>

          {messages.map((m, i) => {
            const cat = categorize(m.content);
            const info = categoryInfo[cat];
            return (
              <div className="q-item" key={m.id}>
                <div className="q-rank">{i + 1}</div>
                <div className="q-text">
                  {m.content.length > 70 ? m.content.slice(0, 70) + "…" : m.content}
                </div>
                <span
                  className="q-pill"
                  style={{
                    background: `${info.color}22`,
                    color: info.color,
                    borderColor: `${info.color}44`,
                  }}
                >
                  {cat}
                </span>
              </div>
            );
          })}
          {messages.length === 0 && (
            <p style={{ color: "var(--mist)", fontSize: 12 }}>No messages yet.</p>
          )}
        </div>
      </div>

      <div className="full-panel">
        <div className="panel-t">
          Leads captured <span>Name · contact · persona · temperature</span>
        </div>
        <div className="leads-table-wrap">
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
      </div>
    </>
  );
}
