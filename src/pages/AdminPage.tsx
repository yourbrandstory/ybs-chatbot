import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "../components/admin/AdminLogin";
import DashboardView from "../components/admin/DashboardView";
import LeadsView from "../components/admin/LeadsView";
import SettingsView from "../components/admin/SettingsView";
import ConversationPanel from "../components/admin/ConversationPanel";
import AdminSidebar from "../components/admin/AdminSidebar";
import MobileTopBar from "../components/MobileTopBar";
import BottomSheet from "../components/BottomSheet";

type View = "dashboard" | "leads" | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [openConvId, setOpenConvId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const viewLabels: Record<View, string> = {
    dashboard: "Dashboard",
    leads: "Leads",
    settings: "Settings",
  };

  useEffect(() => {
    setAuthed(sessionStorage.getItem("ybs_admin") === "true");
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <>
      <MobileTopBar title={viewLabels[view]} onMenuClick={() => setSheetOpen(true)} />
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
              <button
                className={view === "settings" ? "on" : ""}
                onClick={() => setView("settings")}
              >
                Settings
              </button>
              <button
                className="admin-signout"
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
      </div>

      {/* Mobile bottom tab bar */}
      <div className="admin-tab-bar">
        <button
          className={`admin-tab${view === "dashboard" ? " on" : ""}`}
          onClick={() => setView("dashboard")}
        >
          <i className="ti ti-dashboard" />
          <span>Dashboard</span>
        </button>
        <button
          className={`admin-tab${view === "leads" ? " on" : ""}`}
          onClick={() => setView("leads")}
        >
          <i className="ti ti-users" />
          <span>Leads</span>
        </button>
        <button
          className={`admin-tab${view === "settings" ? " on" : ""}`}
          onClick={() => setView("settings")}
        >
          <i className="ti ti-settings" />
          <span>Settings</span>
        </button>
        <button
          className="admin-tab"
          onClick={() => {
            sessionStorage.removeItem("ybs_admin");
            window.location.reload();
          }}
        >
          <i className="ti ti-logout" />
          <span>Sign out</span>
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <nav className="sheet-nav">
          <Link to="/chat" className="sheet-nav-item" onClick={() => setSheetOpen(false)}>
            <i className="ti ti-message" /> Chat assistant
          </Link>
          <Link to="/admin" className="sheet-nav-item on" onClick={() => setSheetOpen(false)}>
            <i className="ti ti-settings" /> Admin
          </Link>
        </nav>
      </BottomSheet>

      {openConvId && (
        <ConversationPanel conversationId={openConvId} onClose={() => setOpenConvId(null)} />
      )}
    </>
  );
}
