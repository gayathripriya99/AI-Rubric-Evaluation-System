
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitAssessment } from "../services/evaluationService";

const QUESTIONS = [
  {
    id: 1,
    title: "Restaurant Kitchen Operations",
    question:
      "Explain the operational workflows of a commercial restaurant kitchen.",
    marks: 10,
    rubric:
      "Evaluate understanding of kitchen stations and staff responsibilities, food preparation workflows, order processing, communication between kitchen teams, and timing and coordination during service. Award marks based on accuracy, completeness, and practical understanding.",
  },
  {
    id: 2,
    title: "Food Safety and Hygiene",
    question:
      "Describe standard safety protocols for food handling and cross-contamination.",
    marks: 10,
    rubric:
      "Evaluate understanding of hand hygiene, prevention of cross-contamination, safe food handling, temperature control, cleaning and sanitization, and proper food storage. Award marks based on accuracy, completeness, and practical application.",
  },
  {
    id: 3,
    title: "Table Service Management",
    question:
      "Detail effective table service strategies during high-volume dining hours.",
    marks: 10,
    rubric:
      "Evaluate understanding of guest greeting, accurate order taking, communication with kitchen staff, service timing, coordination between staff, and maintaining customer experience during busy periods. Award marks based on accuracy, completeness, and relevance.",
  },
  {
    id: 4,
    title: "Inventory and Supply Chain",
    question:
      "How does a restaurant manage supply chains and inventory rotation?",
    marks: 10,
    rubric:
      "Evaluate understanding of demand forecasting, purchasing and receiving stock, inventory records, FIFO or FEFO rotation, storage practices, supplier coordination, and stock control. Award marks based on accuracy, completeness, and practical application.",
  },
  {
    id: 5,
    title: "Customer Dispute Resolution",
    question:
      "Outline customer dispute resolution tactics for frontline waitstaff.",
    marks: 10,
    rubric:
      "Evaluate understanding of active listening, empathy, calm communication, identifying the customer's concern, offering appropriate solutions, escalation when necessary, and follow-up. Award marks based on accuracy, completeness, and professionalism.",
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
  const [confirmed, setConfirmed] = useState(false);

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) => answer.trim().length > 0
      ).length,
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
      setError(
        "Please confirm that your answers are ready for submission."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send all five answers to the backend in one request.
      const response = await submitAssessment(answers);

      // Convert the backend response into the dashboard result format.
      const aggregateResult = {
        status: response.status,
        submission_id: response.submission_id,
        evaluation_status: response.evaluation_status,
        total_score: response.total_score,
        max_score: response.max_score,
        total_questions: response.total_questions,
        completed_questions: response.completed_questions,
        submitted_at: response.submitted_at,
        question_results: response.question_results || [],
      };

      if (onEvaluationComplete) {
        onEvaluationComplete(aggregateResult);
      }

      // The dashboard will retrieve the saved record from PostgreSQL.
      navigate("/");
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit the assessment. Please try again."
      );
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
            evaluated individually against their assessment rubrics.
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
          style={{
            width: `${(answeredCount / QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      {loading ? (
        <section className="evaluation-waiting" aria-live="polite">
          <div className="exam-spinner" />

          <h2>Your assessment is being evaluated</h2>

          <p>
            Your answers have been sent to the backend. The AI
            evaluation and verification workflow is processing them.
          </p>

          <h3>Please wait while your results are prepared.</h3>

          <span>
            Evaluation may take several minutes because the AI models
            are running locally. Please keep this page open.
          </span>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          {QUESTIONS.map((item, index) => (
            <section className="exam-question-card" key={item.id}>
              <div className="question-topline">
                <span>
                  QUESTION {String(index + 1).padStart(2, "0")}
                </span>

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
                onChange={(event) =>
                  updateAnswer(item.id, event.target.value)
                }
                placeholder="Write your answer here..."
                rows={6}
                required
                minLength={10}
                disabled={loading}
              />

              <div className="answer-footer">
                <span>
                  {answers[item.id].trim().length} characters
                </span>

                <span>
                  {answers[item.id].trim()
                    ? "Answered"
                    : "Not answered"}
                </span>
              </div>
            </section>
          ))}

          <section className="exam-submit-card">
            <label className="exam-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) =>
                  setConfirmed(event.target.checked)
                }
              />

              I confirm that I have reviewed my answers and am ready
              to submit.
            </label>

            {error && (
              <div className="exam-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="exam-submit-button"
              type="submit"
              disabled={
                loading ||
                answeredCount !== QUESTIONS.length ||
                !confirmed
              }
            >
              Submit Assessment
            </button>

            <p>
              All five answers will be submitted together and evaluated
              using the multi-agent AI evaluation workflow.
            </p>
          </section>
        </form>
      )}
    </div>
  );
}

export default AssessmentPortal;
