import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  mockLeads,
  stats,
  topQueries,
  defaultSystemPrompt,
  defaultQuickChips,
  type Lead,
} from "@/data/mockLeads";
import { flows, personaLabel, type Msg } from "@/data/conversations";

const PASSWORD = "ybs2024";
const AUTH_KEY = "ybs_admin";
const PROMPT_KEY = "ybs_system_prompt";
const CHIPS_KEY = "ybs_quick_chips";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "YBS TeamMap — Admin Command Centre" },
      {
        name: "description",
        content: "Chatbot conversations, captured leads, and settings for YBS TeamMap.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(sessionStorage.getItem(AUTH_KEY) === "true");
      setChecked(true);
    }
  }, []);

  if (!checked) return null;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  return <AdminShell />;
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (pw === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      onSuccess();
    } else {
      setErr("Incorrect password");
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-brand">
          TeamMap <em>by YBS</em>
        </h1>
        <p className="login-sub">Command centre — admin access</p>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        <button onClick={submit}>Enter</button>
        {err && <div className="login-err">{err}</div>}
        <Link to="/" className="login-back">
          ← Back to chatbot
        </Link>
      </div>
    </div>
  );
}

type View = "dashboard" | "leads" | "settings";

function AdminShell() {
  const [view, setView] = useState<View>("dashboard");
  const [openLead, setOpenLead] = useState<Lead | null>(null);

  return (
    <div className="ybs">
      <div className="top-bar">
        <Link to="/" className="top-tab">
          <i className="ti ti-message" aria-hidden="true" /> Chatbot
        </Link>
        <Link to="/admin" className="top-tab on">
          <i className="ti ti-chart-bar" aria-hidden="true" /> Admin dashboard
        </Link>
      </div>

      <div className="admin-wrap">
        <div className="admin-hd">
          <div>
            <h2>Command centre</h2>
            <p>Chatbot conversations and lead intelligence</p>
          </div>
          <div className="time-badge">Last 7 days</div>
        </div>

        <div className="admin-nav">
          <button className={view === "dashboard" ? "on" : ""} onClick={() => setView("dashboard")}>
            Dashboard
          </button>
          <button className={view === "leads" ? "on" : ""} onClick={() => setView("leads")}>
            Leads
          </button>
          <button className={view === "settings" ? "on" : ""} onClick={() => setView("settings")}>
            Settings
          </button>
          <button
            style={{ marginLeft: "auto", color: "var(--ybs-mute)" }}
            onClick={() => {
              sessionStorage.removeItem(AUTH_KEY);
              location.reload();
            }}
          >
            Sign out
          </button>
        </div>

        {view === "dashboard" && <DashboardView onOpenLead={setOpenLead} />}
        {view === "leads" && <LeadsView />}
        {view === "settings" && <SettingsView />}
      </div>

      {openLead && <ConversationPanel lead={openLead} onClose={() => setOpenLead(null)} />}
    </div>
  );
}

function DashboardView({ onOpenLead }: { onOpenLead: (l: Lead) => void }) {
  return (
    <>
      <div className="stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-l">{s.label}</div>
            <div className="stat-v">{s.value}</div>
            <div className={`stat-s ${s.tone === "green" ? "green" : s.tone === "amber" ? "amber" : ""}`}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-t">
            Recent conversations <span>Live</span>
          </div>
          {mockLeads.map((l) => (
            <button key={l.id} className="conv" onClick={() => onOpenLead(l)}>
              <div className="conv-av">{l.name[0]}</div>
              <div className="conv-mid">
                <div className="conv-name">
                  {l.name.split(" ")[0]} {l.name.split(" ")[1]?.[0]}.
                </div>
                <div className="conv-preview">{l.preview}</div>
              </div>
              <div className="conv-right">
                <span className={`temp ${l.temp.toLowerCase()}`}>{l.temp}</span>
                <span className="conv-time">{l.when}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="panel">
          <div className="panel-t">
            Top queries <span>This week</span>
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
              <th>Messages</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {mockLeads.map((l) => (
              <tr key={l.id}>
                <td className="nm">{l.name}</td>
                <td>{l.email}</td>
                <td>
                  <span className="p-tag">{personaLabel[l.persona]}</span>
                </td>
                <td>
                  <span className={`temp ${l.temp.toLowerCase()}`}>{l.temp}</span>
                </td>
                <td>{l.messages}</td>
                <td>{l.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LeadsView() {
  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Persona",
      "Temperature",
      "Messages",
      "Team size",
      "Current tools",
      "When",
    ];
    const rows = mockLeads.map((l) => [
      l.name,
      l.email,
      l.phone,
      personaLabel[l.persona],
      l.temp,
      String(l.messages),
      l.teamSize,
      l.currentTools,
      l.when,
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

  return (
    <div className="full-panel">
      <div className="panel-t">
        All leads <span>{mockLeads.length} total</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="export-b" onClick={exportCsv}>
          <i className="ti ti-download" aria-hidden="true" /> Export CSV
        </button>
      </div>
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
          {mockLeads.map((l) => (
            <tr key={l.id}>
              <td className="nm">{l.name}</td>
              <td>{l.email}</td>
              <td>{l.phone}</td>
              <td>
                <span className="p-tag">{personaLabel[l.persona]}</span>
              </td>
              <td>{l.teamSize}</td>
              <td>{l.currentTools}</td>
              <td>
                <span className={`temp ${l.temp.toLowerCase()}`}>{l.temp}</span>
              </td>
              <td>{l.messages}</td>
              <td>{l.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsView() {
  const [prompt, setPrompt] = useState(defaultSystemPrompt);
  const [chips, setChips] = useState(defaultQuickChips);

  useEffect(() => {
    const p = localStorage.getItem(PROMPT_KEY);
    const c = localStorage.getItem(CHIPS_KEY);
    if (p) setPrompt(p);
    if (c) setChips(c);
  }, []);

  return (
    <>
      <div className="settings-block">
        <h3>AI system prompt</h3>
        <p>How the assistant introduces itself, what it can talk about, and its tone of voice.</p>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button
          className="save-b"
          onClick={() => {
            localStorage.setItem(PROMPT_KEY, prompt);
            console.log("[YBS] system prompt saved");
          }}
        >
          Save prompt
        </button>
      </div>

      <div className="settings-block">
        <h3>Quick chips</h3>
        <p>Pipe-separated suggestions shown under the chat before the conversation starts.</p>
        <textarea
          style={{ minHeight: 100 }}
          value={chips}
          onChange={(e) => setChips(e.target.value)}
        />
        <button
          className="save-b"
          onClick={() => {
            localStorage.setItem(CHIPS_KEY, chips);
            console.log("[YBS] quick chips saved");
          }}
        >
          Save chips
        </button>
      </div>
    </>
  );
}

function ConversationPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const thread: Msg[] = flows[lead.persona];
  return (
    <div className="side-panel-scrim" onClick={onClose}>
      <div className="side-panel" onClick={(e) => e.stopPropagation()}>
        <div className="side-panel-hd">
          <div className="conv-av">{lead.name[0]}</div>
          <div>
            <h3>{lead.name}</h3>
            <p>
              {lead.email} · {personaLabel[lead.persona]} · {lead.messages} messages
            </p>
          </div>
          <button className="side-panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="side-panel-body">
          <div className="msg-row user">
            <div className="msg-av">P</div>
            <div>
              <div className="bubble">{lead.preview}</div>
              <div className="msg-time">{lead.when}</div>
            </div>
          </div>
          {thread.map((m, i) => (
            <div key={i} className={`msg-row ${m.role}`}>
              <div className="msg-av">{m.role === "bot" ? "Y" : "P"}</div>
              <div>
                <div className="bubble">{m.text}</div>
                <div className="msg-time">Just now</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
