
function Header({
  title = "Overview",
  subtitle = "Welcome to your assessment workspace.",
  onMenuClick,
}) {
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
          <div className="profile-avatar">T</div>
          <div className="profile-details">
            <strong>Teacher</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
