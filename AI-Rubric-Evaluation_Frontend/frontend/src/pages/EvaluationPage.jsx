
import { useState } from "react";

import EvaluationForm from "../components/EvaluationForm";
import EvaluationResults from "../components/EvaluationResults";
import { evaluateWithAgents } from "../services/evaluationService";

function EvaluationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleEvaluation = async (payload) => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await evaluateWithAgents(payload);
      setResult(response);
    } catch (err) {
      setError(err.message || "Evaluation could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnother = () => {
    setResult(null);
    setError("");
  };

  return (
    <main className="evaluation-page">
      {loading ? (
        <section className="evaluation-waiting" aria-live="polite">
          <div className="loading-spinner"></div>

          <h2>Your answer is being evaluated</h2>

          <p>
            Please wait while our AI evaluator assesses your answer
            against the rubric and our verifier checks the evaluation.
          </p>

          <p className="waiting-note">
            This may take a little time because the AI models are
            running locally on your computer.
          </p>
        </section>
      ) : result ? (
        <EvaluationResults
          result={result}
          onEvaluateAnother={handleEvaluateAnother}
        />
      ) : (
        <>
          {error && (
            <div className="evaluation-error" role="alert">
              <strong>Evaluation failed:</strong> {error}
            </div>
          )}

          <EvaluationForm
            onSubmit={handleEvaluation}
            loading={loading}
          />
        </>
      )}
    </main>
  );
}

export default EvaluationPage;
