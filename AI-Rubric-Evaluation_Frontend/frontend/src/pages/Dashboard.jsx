
import { Link } from "react-router-dom";

function Dashboard({ latestEvaluation }) {
  const evaluation =
    latestEvaluation?.evaluation ||
    latestEvaluation?.result ||
    latestEvaluation;

  const score =
    evaluation?.total_score ??
    evaluation?.score ??
    evaluation?.obtained_marks;

  const maxScore =
    evaluation?.max_score ??
    evaluation?.total_marks ??
    50;

const status = latestEvaluation
  ? "Evaluation Completed"
  : "No Submission Yet";

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span>RUBRIC AI ASSESSMENT SYSTEM</span>
          <h1>Assessment Dashboard</h1>
          <p>Track your submissions and review your AI evaluation results.</p>
        </div>

        <Link to="/assessment" className="dashboard-primary-button">
          Start Assessment
        </Link>
      </section>

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
          <small>Based on returned evaluation data</small>
        </article>

        <article className="dashboard-stat">
          <span>Evaluation Method</span>
          <h2>AI + Rubric</h2>
          <small>Automated assessment workflow</small>
        </article>

        <article className="dashboard-stat">
          <span>Assessment Questions</span>
          <h2>5</h2>
          <small>50 total marks</small>
        </article>
      </section>

      <section className="dashboard-result">
        <div className="dashboard-result-heading">
          <div>
            <span className="dashboard-section-label">LATEST RESULT</span>
            <h2>Your Rubric Evaluation</h2>
          </div>
          <span className="dashboard-status">{status}</span>
        </div>

        {/* {latestEvaluation ? (
          <>
            <div className="dashboard-score">
              <span>Score</span>
              <strong>
                {score !== undefined && score !== null
                  ? `${score} / ${maxScore}`
                  : "Result received"}
              </strong>
            </div>

            <h3>Detailed evaluation response</h3>
            <pre className="evaluation-json">
              {JSON.stringify(latestEvaluation, null, 2)}
            </pre>
          </>
        ) : (
          <div className="dashboard-empty">
            <h3>No assessment submitted yet</h3>
            <p>
              Complete your five-question examination to see your rubric
              evaluation, marks and feedback here.
            </p>
            <Link to="/assessment" className="dashboard-primary-button">
              Go to Examination
            </Link>
          </div>
        )} */}
        {latestEvaluation ? (
  <div className="dashboard-result-content">
    <div className="dashboard-success-banner">
      <span>✓</span>
      <div>
        <strong>Assessment submitted successfully!</strong>
        <p>Your evaluation response has been received.</p>
      </div>
    </div>

    <div className="dashboard-score">
      <span>Evaluation Status</span>
      <strong>{status}</strong>
    </div>

    <h3>Your Evaluation Result</h3>

    <pre className="evaluation-json">
      {JSON.stringify(latestEvaluation, null, 2)}
    </pre>

    {/* <Link to="/assessment" className="dashboard-primary-button">
      Take Another Assessment
    </Link> */}
  </div>
) : (
  <div className="dashboard-empty">
    <h3>No assessment submitted yet</h3>
    <p>Submit your examination to view your evaluation here.</p>
    <Link to="/assessment" className="dashboard-primary-button">
      Start Assessment
    </Link>
  </div>
)}
      </section>
    </div>
  );
}

export default Dashboard;
