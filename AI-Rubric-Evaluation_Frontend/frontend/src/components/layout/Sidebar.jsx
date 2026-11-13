
import { NavLink } from "react-router-dom";

const navigationItems = [
  { path: "/", label: "Overview", icon: "..." },
  { path: "/evaluation", label: "New Evaluation", icon: "..." },
  { path: "/assessment", label: "Assessment Portal", icon: "clipboard-list" },
  { path: "/history", label: "Evaluation History", icon: "..." },
  { path: "/rubrics", label: "Rubric Management", icon: "..." },
  { path: "/analytics", label: "Analytics", icon: "..." },
  { path: "/review-queue", label: "Review Queue", icon: "..." },
];
function Sidebar({ isOpen = true, onNavigate }) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onNavigate}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">R</div>
          <div>
            <h2>RubricAI</h2>
            <span>Intelligent Assessment</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onNavigate}
            >
              <span className="sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <strong>Need help?</strong>
            <p>Learn how to use RubricAI effectively.</p>
            <button type="button">View documentation</button>
          </div>

          <div className="sidebar-version">
            RubricAI · Development
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
