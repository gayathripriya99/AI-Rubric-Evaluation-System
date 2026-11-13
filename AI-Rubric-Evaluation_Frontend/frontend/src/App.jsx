
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import AssessmentPortal from "./pages/AssessmentPortal";
import EvaluationPage from "./pages/EvaluationPage";

function Placeholder({ title, description }) {
  return (
    <section className="exam-review-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function AppContent() {
  const [latestEvaluation, setLatestEvaluation] = useState(null);

  return (
    <Routes>
      <Route
        path="/"
        element={<Dashboard latestEvaluation={latestEvaluation} />}
      />

      <Route
        path="/assessment"
        element={
          <AssessmentPortal
            onEvaluationComplete={setLatestEvaluation}
          />
        }
      />

      <Route
        path="/evaluation"
        element={<EvaluationPage />}
      />

      <Route
        path="/history"
        element={
          <Placeholder
            title="Evaluation History"
            description="Your saved evaluation records will appear here."
          />
        }
      />

      <Route
        path="/rubrics"
        element={
          <Placeholder
            title="Rubric Management"
            description="Manage assessment rubrics and scoring criteria."
          />
        }
      />

      <Route
        path="/analytics"
        element={
          <Placeholder
            title="Analytics"
            description="Explore assessment performance and trends."
          />
        }
      />

      <Route
        path="/review-queue"
        element={
          <Placeholder
            title="Review Queue"
            description="Review evaluations requiring human verification."
          />
        }
      />

      <Route
        path="*"
        element={<Placeholder title="Page Not Found" description="This page does not exist." />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
