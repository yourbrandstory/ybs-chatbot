export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>
          TeamMap <em>by YBS</em>
        </h1>
        <p>Command centre</p>
      </div>
      <nav className="sidebar-nav">{/* Nav is handled in AdminShell */}</nav>
      <div className="sidebar-foot">YBS Solutions &middot; Admin</div>
    </aside>
  );
}
