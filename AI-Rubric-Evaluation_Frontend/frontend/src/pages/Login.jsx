
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await loginUser(email, password);

      onLoginSuccess(user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-brand">
          <div className="login-brand-logo">R</div>

          <div>
            <h1>RubricAI</h1>
            <p>Intelligent Assessment Platform</p>
          </div>
        </div>

        <div className="login-heading">
          <span>WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p>
            Access your assessments and AI-powered evaluation results.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email address</label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Secure access to your AI-powered assessment workspace.
        </p>

      </section>
    </main>
  );
}
