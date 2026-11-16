
import { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AssessmentPortal from "./pages/AssessmentPortal";
import EvaluationPage from "./pages/EvaluationPage";
import Login from "./pages/Login";

import Layout from "./components/layout/Layout";
import { getCurrentUser, logoutUser } from "./services/authService";

// Public landing page
function LandingPage() {
  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Evaluation",
      description:
        "Evaluate student answers using an AI-powered assessment workflow.",
    },
    {
      icon: "📋",
      title: "Rubric-Based Scoring",
      description:
        "Assess answers against structured rubrics and scoring criteria.",
    },
    {
      icon: "📊",
      title: "Performance Tracking",
      description:
        "Track assessment scores and review previous submissions.",
    },
    {
      icon: "💡",
      title: "Detailed Feedback",
      description:
        "Understand strengths, missing concepts and areas for improvement.",
    },
  ];

  return (
    <main className="landing-page">
      <header className="landing-navbar">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">R</span>
          <span>Rubric AI</span>
        </Link>

        <nav className="landing-navigation">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="landing-login">
            Login
          </Link>
          <Link to="/login" className="landing-nav-button">
            Get Started
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            AI-POWERED ASSESSMENT PLATFORM
          </span>

          <h1>
            Evaluate Smarter.
            <span> Learn Better.</span>
          </h1>

          <p>
            Transform traditional assessments with AI-powered
            evaluation, structured rubric scoring and
            personalized feedback.
          </p>

          <div className="landing-hero-actions">
            <Link to="/login" className="landing-primary-button">
              Get Started <span>→</span>
            </Link>

            <a href="#features" className="landing-secondary-button">
              Explore Features
            </a>
          </div>

          <div className="landing-trust-line">
            <span>✓</span>
            Structured assessment
            <span>✓</span>
            Actionable feedback
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-preview-card">
            <div className="landing-preview-header">
              <div>
                <span>ASSESSMENT OVERVIEW</span>
                <h3>Student Performance</h3>
              </div>
              <span className="landing-preview-icon">✦</span>
            </div>

            <div className="landing-score-preview">
              <div>
                <span>Sample evaluation score</span>
                <strong>40/50</strong>
                <small>80% performance</small>
              </div>

              <div className="landing-score-circle">
                <span>80%</span>
              </div>
            </div>

            <div className="landing-preview-divider" />

            <div className="landing-preview-item">
              <span>✓</span>
              <div>
                <strong>Strengths identified</strong>
                <small>Review what you did well</small>
              </div>
            </div>

            <div className="landing-preview-item">
              <span>✦</span>
              <div>
                <strong>Improvement suggestions</strong>
                <small>Discover areas to improve</small>
              </div>
            </div>

            <div className="landing-preview-item">
              <span>▤</span>
              <div>
                <strong>Rubric-based feedback</strong>
                <small>Understand your evaluation</small>
              </div>
            </div>

            <p className="landing-preview-disclaimer">
              Illustrative example of the platform interface.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span>PLATFORM FEATURES</span>
          <h2>Everything you need for smarter assessment</h2>
          <p>
            A structured platform for evaluation, feedback
            and continuous learning.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-about" id="about">
        <div>
          <span>BUILT FOR BETTER LEARNING</span>
          <h2>Make every evaluation meaningful.</h2>
          <p>
            Rubric AI brings assessment workflows,
            AI-generated feedback and student performance
            records together in one platform.
          </p>
        </div>

        <Link to="/login" className="landing-primary-button">
          Access Platform →
        </Link>
      </section>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">R</span>
          <span>Rubric AI</span>
        </Link>

        <p>AI-powered assessment and evaluation platform.</p>
        <span>© 2026 Rubric AI</span>
      </footer>
    </main>
  );
}

function Placeholder({ title, description }) {
  return (
    <section className="exam-review-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function ProtectedRoute({ user, checkingSession, children }) {
  if (checkingSession) {
    return (
      <div className="evaluation-waiting">
        <div className="exam-spinner" />
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ user, allowedRoles, children }) {
  const userRole = user?.role?.toLowerCase();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [latestEvaluation, setLatestEvaluation] = useState(null);

  function handleLogout() {
    logoutUser();
    setUser(null);
    setLatestEvaluation(null);
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Session restoration failed:", error);
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <Routes>
      {/* Public landing page */}
      <Route
        path="/"
        element={
          checkingSession ? (
            <div className="evaluation-waiting">
              <div className="exam-spinner" />
              <p>Loading Rubric AI...</p>
            </div>
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Public login */}
      <Route
        path="/login"
        element={
          checkingSession ? (
            <div className="evaluation-waiting">
              <div className="exam-spinner" />
              <p>Checking your session...</p>
            </div>
          ) : user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={setUser} />
          )
        }
      />

      {/* Protected application */}
      <Route
        element={
          <ProtectedRoute
            user={user}
            checkingSession={checkingSession}
          >
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <RoleRoute
              user={user}
              allowedRoles={["student", "admin", "reviewer"]}
            >
              <Dashboard latestEvaluation={latestEvaluation} />
            </RoleRoute>
          }
        />

        <Route
          path="/assessment"
          element={
            <RoleRoute user={user} allowedRoles={["student"]}>
              <AssessmentPortal
                onEvaluationComplete={setLatestEvaluation}
              />
            </RoleRoute>
          }
        />

        <Route
          path="/evaluation"
          element={
            <RoleRoute user={user} allowedRoles={["admin", "reviewer"]}>
              <EvaluationPage />
            </RoleRoute>
          }
        />

        <Route
          path="/history"
          element={
            <RoleRoute user={user} allowedRoles={["student", "reviewer"]}>
              <Placeholder
                title="Evaluation History"
                description="Your saved evaluation records will appear here."
              />
            </RoleRoute>
          }
        />

        <Route
          path="/rubrics"
          element={
            <RoleRoute user={user} allowedRoles={["admin"]}>
              <Placeholder
                title="Rubric Management"
                description="Manage assessment rubrics and scoring criteria."
              />
            </RoleRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <RoleRoute user={user} allowedRoles={["admin"]}>
              <Placeholder
                title="Analytics"
                description="Explore assessment performance and trends."
              />
            </RoleRoute>
          }
        />

        <Route
          path="/review-queue"
          element={
            <RoleRoute user={user} allowedRoles={["admin", "reviewer"]}>
              <Placeholder
                title="Review Queue"
                description="Review evaluations requiring human verification."
              />
            </RoleRoute>
          }
        />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
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
