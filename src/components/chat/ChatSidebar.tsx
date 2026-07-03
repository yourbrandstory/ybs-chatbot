import { Link, useLocation } from "react-router-dom";

export default function ChatSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>
          TeamMap <em>by YBS</em>
        </h1>
        <p>Solutions</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/chat" className={pathname === "/chat" ? "on" : ""}>
          <i className="ti ti-message" /> Chat assistant
        </Link>
      </nav>
      <div className="sidebar-foot">
        <Link to="/admin">Admin</Link> &middot; YBS Solutions
        <br />
        Logged in as visitor
      </div>
    </aside>
  );
}
