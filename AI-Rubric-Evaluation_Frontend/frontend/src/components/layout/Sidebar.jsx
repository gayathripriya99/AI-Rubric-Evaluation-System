
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    path: "/",
    label: "Overview",
    icon: "◫",
    roles: ["student", "admin", "reviewer"],
  },
  {
    path: "/evaluation",
    label: "New Evaluation",
    icon: "✎",
    roles: ["admin", "reviewer"],
  },
  {
    path: "/assessment",
    label: "Assessment Portal",
    icon: "▤",
    roles: ["student"],
  },
  {
    path: "/history",
    label: "Evaluation History",
    icon: "◷",
    roles: ["student", "reviewer"],
  },
  {
    path: "/rubrics",
    label: "Rubric Management",
    icon: "▦",
    roles: ["admin"],
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: "▥",
    roles: ["admin"],
  },
  {
    path: "/review-queue",
    label: "Review Queue",
    icon: "☷",
    roles: ["admin", "reviewer"],
  },
];

function Sidebar({ isOpen = false, onNavigate, user }) {
  const role = user?.role?.toLowerCase() || "student";

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(role)
  );

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
          {visibleItems.map((item) => (
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
