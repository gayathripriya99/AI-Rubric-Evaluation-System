
function EvaluationResults({ result, onEvaluateAnother }) {
  if (!result) return null;

  const evaluation = result.evaluation;
  const verification = result.verification;

  return (
    <section className="evaluation-results">
      <div className="results-header">
        <h2>Evaluation Report</h2>
        <span>
          {result.evaluation_status === "verified"
            ? "Verified"
            : "Manual Review Required"}
        </span>
      </div>

      <div className="score-card">
        <p>AI Evaluation Score</p>
        <h1>
          {evaluation.score} / {evaluation.max_score ?? "—"}
        </h1>
      </div>

      <div className="result-section">
        <h3>Strengths</h3>
        {evaluation.strengths?.length ? (
          <ul>
            {evaluation.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No strengths identified.</p>
        )}
      </div>

      <div className="result-section">
        <h3>Missing Concepts</h3>
        {evaluation.missing_concepts?.length ? (
          <ul>
            {evaluation.missing_concepts.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No missing concepts identified.</p>
        )}
      </div>

      <div className="result-section">
        <h3>Detailed Feedback</h3>
        <p>{evaluation.feedback}</p>
      </div>

      <div className="result-section">
        <h3>Improvement Suggestions</h3>
        <p>{evaluation.improvement_suggestion}</p>
      </div>

      <div className="result-section">
        <h3>Verifier Report</h3>
        <p>
          Verification: {verification.valid ? "Passed" : "Needs Review"}
        </p>

        {verification.issues?.length > 0 && (
          <ul>
            {verification.issues.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        <p>{verification.recommendation}</p>
      </div>

      <button onClick={onEvaluateAnother}>
        Evaluate Another Answer
      </button>
    </section>
  );
}

export default EvaluationResults;
