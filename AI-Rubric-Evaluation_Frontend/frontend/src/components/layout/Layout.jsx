
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const pageDetails = {
  "/": {
    title: "Overview",
    subtitle: "Welcome to your assessment workspace.",
  },
  "/evaluation": {
    title: "New Evaluation",
    subtitle: "Evaluate student answers using AI.",
  },
  "/assessment": {
    title: "Assessment Portal",
    subtitle: "Complete the assessment.",
  },
  "/history": {
    title: "Evaluation History",
    subtitle: "Review previous evaluations.",
  },
  "/rubrics": {
    title: "Rubric Management",
    subtitle: "Manage assessment rubrics.",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Explore evaluation trends.",
  },
  "/review-queue": {
    title: "Review Queue",
    subtitle: "Review evaluations requiring attention.",
  },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = pageDetails[location.pathname] || {
    title: "RubricAI",
    subtitle: "Assessment workspace.",
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Header
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
