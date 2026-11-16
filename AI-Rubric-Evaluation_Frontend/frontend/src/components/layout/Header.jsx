
function Header({
  title = "Overview",
  subtitle = "Welcome to your assessment workspace.",
  onMenuClick,
  user,
  onLogout,
}) {
  const fullName = user?.full_name || "User";
  const role = user?.role || "student";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedRole =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div className="header-heading">
          <div className="header-breadcrumb">
            Workspace <span>/</span> {title}
          </div>

          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-status">
          <span className="status-indicator" />
          Local AI Engine
        </div>

        <div className="header-profile">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-details">
            <strong>{fullName}</strong>
            <span>{formattedRole}</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
