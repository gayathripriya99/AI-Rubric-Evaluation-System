
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const QUESTIONS = [
  {
    id: 1,
    title: "Restaurant Kitchen Operations",
    question: "Explain the operational workflows of a commercial restaurant kitchen.",
    marks: 10,
  },
  {
    id: 2,
    title: "Food Safety and Hygiene",
    question: "Describe standard safety protocols for food handling and cross-contamination.",
    marks: 10,
  },
  {
    id: 3,
    title: "Table Service Management",
    question: "Detail effective table service strategies during high-volume dining hours.",
    marks: 10,
  },
  {
    id: 4,
    title: "Inventory and Supply Chain",
    question: "How does a restaurant manage supply chains and inventory rotation?",
    marks: 10,
  },
  {
    id: 5,
    title: "Customer Dispute Resolution",
    question: "Outline customer dispute resolution tactics for frontline waitstaff.",
    marks: 10,
  },
];

function AssessmentPortal({ onEvaluationComplete }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.trim().length > 0).length,
    [answers]
  );

  const updateAnswer = (id, value) => {
    setAnswers((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (answeredCount !== QUESTIONS.length) {
      setError("Please answer all five questions before submitting.");
      return;
    }

    if (!confirmed) {
      setError("Please confirm that your answers are ready for submission.");
      return;
    }

    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The assessment could not be evaluated."
        );
      }

      setEvaluation(data);

      if (onEvaluationComplete) {
        onEvaluationComplete(data);
      }
      // Redirect the student to the dashboard.
navigate("/");
    } catch (err) {
      setError(err.message || "Unable to connect to the evaluation server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-page">
      <section className="exam-intro">
        <div>
          <span className="exam-eyebrow">STUDENT ASSESSMENT</span>
          <h1>Restaurant Operations Examination</h1>
          <p>
            Answer all five questions carefully. Your answers will be
            evaluated against the assessment rubric using our AI evaluation system.
          </p>
        </div>

        <div className="exam-total">
          <strong>50</strong>
          <span>Total Marks</span>
        </div>
      </section>

      <section className="exam-information">
        <div>
          <strong>5 Questions</strong>
          <span>Complete every question</span>
        </div>
        <div>
          <strong>10 Marks</strong>
          <span>Per question</span>
        </div>
        <div>
          <strong>{answeredCount}/5</strong>
          <span>Questions answered</span>
        </div>
      </section>

      <div className="exam-progress">
        <div
          className="exam-progress-fill"
          style={{ width: `${(answeredCount / 5) * 100}%` }}
        />
      </div>

      {loading ? (
        <section className="evaluation-waiting">
          <div className="exam-spinner" />
          <h2>Your assessment is being evaluated</h2>
          <p>
            The AI evaluation engine is reviewing your answers against the
            rubric. Please wait for the result.
          </p>
          <span>Do not close this page while the request is processing.</span>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          {QUESTIONS.map((item, index) => (
            <section className="exam-question-card" key={item.id}>
              <div className="question-topline">
                <span>QUESTION {String(index + 1).padStart(2, "0")}</span>
                <span>{item.marks} Marks</span>
              </div>

              <h2>{item.title}</h2>
              <p className="question-text">{item.question}</p>

              <label htmlFor={`answer-${item.id}`}>
                Your answer
              </label>

              <textarea
                id={`answer-${item.id}`}
                value={answers[item.id]}
                onChange={(event) => updateAnswer(item.id, event.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                required
                minLength={10}
                disabled={loading}
              />

              <div className="answer-footer">
                <span>{answers[item.id].trim().length} characters</span>
                <span>{answers[item.id].trim() ? "Answered" : "Not answered"}</span>
              </div>
            </section>
          ))}

          <section className="exam-submit-card">
            <label className="exam-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              I confirm that I have reviewed my answers and am ready to submit.
            </label>

            {error && (
              <div className="exam-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="exam-submit-button"
              type="submit"
              disabled={loading || answeredCount !== 5 || !confirmed}
            >
              Submit Assessment
            </button>

            <p>
              Once submitted, your answers will be sent for AI rubric evaluation.
            </p>
          </section>
        </form>
      )}

      {evaluation && (
        <section className="exam-review-card">
          <span className="exam-eyebrow">EVALUATION COMPLETED</span>
          <h2>Your Assessment Review</h2>
          <p>Your evaluation response has been received.</p>

          <pre className="evaluation-json">
            {JSON.stringify(evaluation, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

export default AssessmentPortal;
