
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMySubmissions } from "../services/dashboardService";

function FeedbackList({ title, items }) {
  if (!items || (Array.isArray(items) && items.length === 0)) {
    return null;
  }

  const list = Array.isArray(items) ? items : [items];

  return (
    <div className="feedback-section">
      <h4>{title}</h4>
      <ul>
        {list.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setLoading(true);
        setError("");

        const data = await getMySubmissions();

        setSubmissions(data.submissions || []);
      } catch (err) {
        setError(err.message || "Unable to load assessment history.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, []);

  const latestEvaluation = submissions[0] || null;

  const questionResults =
    latestEvaluation?.question_results || [];

  const score = latestEvaluation?.total_score;
  const maxScore = latestEvaluation?.max_score ?? 50;

  const percentage =
    score !== undefined && score !== null && maxScore > 0
      ? ((score / maxScore) * 100).toFixed(1)
      : null;

  const status = latestEvaluation
    ? latestEvaluation.status === "manual_review"
      ? "Awaiting Manual Review"
      : latestEvaluation.status === "failed"
        ? "Evaluation Failed"
        : "Evaluation Completed"
    : "No Submission Yet";

  if (loading) {
    return (
      <div className="evaluation-waiting">
        <div className="exam-spinner" />
        <p>Loading your assessment dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span>RUBRIC AI ASSESSMENT SYSTEM</span>
          <h1>Assessment Dashboard</h1>
          <p>
            Track your submissions, review your AI evaluation
            results and identify areas for improvement.
          </p>
        </div>

        <Link to="/assessment" className="dashboard-primary-button">
          Start Assessment
        </Link>
      </section>

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat">
          <span>Assessment Status</span>
          <h2>{status}</h2>
          <small>Latest submission</small>
        </article>

        <article className="dashboard-stat">
          <span>Latest Score</span>
          <h2>
            {score !== undefined && score !== null
              ? `${score} / ${maxScore}`
              : "—"}
          </h2>
          <small>Overall marks</small>
        </article>

        <article className="dashboard-stat">
          <span>Percentage</span>
          <h2>{percentage !== null ? `${percentage}%` : "—"}</h2>
          <small>Overall performance</small>
        </article>

        <article className="dashboard-stat">
          <span>Total Submissions</span>
          <h2>{submissions.length}</h2>
          <small>Saved in PostgreSQL</small>
        </article>
      </section>

      <section className="dashboard-result">
        <div className="dashboard-result-heading">
          <div>
            <span className="dashboard-section-label">
              LATEST RESULT
            </span>
            <h2>Your Rubric Evaluation</h2>
          </div>

          <span className="dashboard-status">{status}</span>
        </div>

        {!latestEvaluation ? (
          <div className="dashboard-empty">
            <h3>No assessment submitted yet</h3>
            <p>
              Complete your examination to view your scores,
              feedback and improvement suggestions.
            </p>

            <Link
              to="/assessment"
              className="dashboard-primary-button"
            >
              Start Assessment
            </Link>
          </div>
        ) : (
          <div className="dashboard-result-content">
            <div className="dashboard-success-banner">
              <span>✓</span>
              <div>
                <strong>
                  {latestEvaluation.status === "manual_review"
                    ? "Your assessment requires manual review."
                    : latestEvaluation.status === "failed"
                      ? "Your assessment evaluation failed."
                      : "Your assessment results are saved!"}
                </strong>
                <p>
                  {latestEvaluation.assessment_title}
                </p>
              </div>
            </div>

            <div className="dashboard-score">
              <span>Overall Assessment Score</span>

              <strong>
                {score !== null && score !== undefined
                  ? `${score} / ${maxScore}`
                  : "Pending"}
              </strong>

              <div className="score-progress">
                <div
                  className="score-progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, Number(percentage) || 0)
                    )}%`,
                  }}
                />
              </div>

              <p>
                {percentage !== null
                  ? `${percentage}% overall performance`
                  : "Evaluation results are not available yet."}
              </p>
            </div>

            <div className="question-results-heading">
              <h3>Question-wise Evaluation</h3>
              <p>
                Review the marks and detailed feedback for each answer.
              </p>
            </div>

            {questionResults.length === 0 ? (
              <p>No individual question results are available yet.</p>
            ) : (
              questionResults.map((item) => (
                <article
                  className="question-result-card"
                  key={item.question_id}
                >
                  <div className="question-result-header">
                    <div>
                      <span>
                        QUESTION{" "}
                        {String(item.question_id).padStart(2, "0")}
                      </span>
                      <h3>{item.title}</h3>
                    </div>

                    <div className="question-result-score">
                      <strong>
                        {item.score ?? "Pending"}
                      </strong>
                      <span>/ {item.max_score} marks</span>
                    </div>
                  </div>

                  <p className="question-result-text">
                    {item.question}
                  </p>

                  <FeedbackList
                    title="Strengths"
                    items={item.strengths}
                  />

                  <FeedbackList
                    title="Missing Concepts"
                    items={item.missing_concepts}
                  />

                  {item.feedback && (
                    <div className="feedback-section">
                      <h4>AI Feedback</h4>
                      <p>{item.feedback}</p>
                    </div>
                  )}

                  {item.improvement_suggestion && (
                    <div className="feedback-section improvement-feedback">
                      <h4>Improvement Suggestions</h4>
                      <p>{item.improvement_suggestion}</p>
                    </div>
                  )}
                </article>
              ))
            )}

            <p className="dashboard-result-note">
              Your assessment records and evaluation results are
              retrieved from PostgreSQL.
            </p>

            <Link
              to="/assessment"
              className="dashboard-primary-button"
            >
              Take Another Assessment
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
