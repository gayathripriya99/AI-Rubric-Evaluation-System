
import { useState } from "react";

function EvaluationForm({ onSubmit, loading }) {
  const [question, setQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [rubric, setRubric] = useState("");
  const [maxScore, setMaxScore] = useState(10);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      question: question.trim(),
      student_answer: studentAnswer.trim(),
      rubric: rubric.trim(),
      max_score: Number(maxScore),
    });
  };

  return (
    <section className="evaluation-form">
      <h2>Submit Your Answer</h2>
      <p>Enter the question, answer and marking rubric.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter the evaluation question"
          required
          minLength={3}
          disabled={loading}
        />

        <label htmlFor="answer">Student Answer</label>
        <textarea
          id="answer"
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Enter the student's answer"
          required
          disabled={loading}
        />

        <label htmlFor="rubric">Evaluation Rubric</label>
        <textarea
          id="rubric"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          placeholder="Enter marking criteria and marks"
          required
          minLength={3}
          disabled={loading}
        />

        <label htmlFor="maxScore">Maximum Score</label>
        <input
          id="maxScore"
          type="number"
          min="0.1"
          max="100"
          step="0.1"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit for AI Evaluation"}
        </button>
      </form>
    </section>
  );
}

export default EvaluationForm;
