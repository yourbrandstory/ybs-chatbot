import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "../components/admin/AdminLogin";
import DashboardView from "../components/admin/DashboardView";
import LeadsView from "../components/admin/LeadsView";
import SettingsView from "../components/admin/SettingsView";
import ConversationPanel from "../components/admin/ConversationPanel";
import AdminSidebar from "../components/admin/AdminSidebar";

type View = "dashboard" | "leads" | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [openConvId, setOpenConvId] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("ybs_admin") === "true");
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <div className="ybs-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-wrap">
          <div className="admin-hd">
            <div>
              <h2>Command centre</h2>
              <p>Chatbot conversations and lead intelligence</p>
            </div>
            <div className="time-badge">Last 7 days</div>
          </div>

          <div className="admin-nav">
            <button
              className={view === "dashboard" ? "on" : ""}
              onClick={() => setView("dashboard")}
            >
              Dashboard
            </button>
            <button className={view === "leads" ? "on" : ""} onClick={() => setView("leads")}>
              Leads
            </button>
            <button className={view === "settings" ? "on" : ""} onClick={() => setView("settings")}>
              Settings
            </button>
            <button
              style={{ marginLeft: "auto", color: "var(--mist)" }}
              onClick={() => {
                sessionStorage.removeItem("ybs_admin");
                window.location.reload();
              }}
            >
              Sign out
            </button>
          </div>

          {view === "dashboard" && <DashboardView onOpenConversation={setOpenConvId} />}
          {view === "leads" && <LeadsView />}
          {view === "settings" && <SettingsView />}
        </div>
      </div>

      {openConvId && (
        <ConversationPanel conversationId={openConvId} onClose={() => setOpenConvId(null)} />
      )}
    </div>
  );
}
