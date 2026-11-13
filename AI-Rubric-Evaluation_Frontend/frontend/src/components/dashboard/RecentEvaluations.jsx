
function RecentEvaluations({ evaluations = [], loading = false }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "verified":
        return "evaluation-status verified";

      case "manual_review_required":
        return "evaluation-status review";

      case "processing":
        return "evaluation-status processing";

      default:
        return "evaluation-status pending";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      verified: "Verified",
      manual_review_required: "Manual Review",
      processing: "Processing",
      pending: "Pending",
    };

    return labels[status] || "Pending";
  };

  return (
    <section className="recent-evaluations">
      <div className="recent-evaluations-header">
        <div>
          <h2>Recent Evaluations</h2>
          <p>Latest student assessment activity</p>
        </div>

        <a href="/history" className="view-all-link">
          View all →
        </a>
      </div>

      {loading ? (
        <div className="evaluations-empty">
          Loading evaluations...
        </div>
      ) : evaluations.length === 0 ? (
        <div className="evaluations-empty">
          <div className="empty-icon">▤</div>
          <h3>No evaluations yet</h3>
          <p>
            Your recent student evaluations will appear here
            after the first submission.
          </p>
          <a href="/evaluation" className="empty-action">
            Start New Evaluation
          </a>
        </div>
      ) : (
        <div className="evaluations-table-wrapper">
          <table className="evaluations-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment</th>
                <th>Score</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {evaluations.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_name || "Student"}</td>
                  <td>{item.assessment_name || "Assessment"}</td>
                  <td>
                    {item.score ?? "—"}
                    {item.max_score != null
                      ? ` / ${item.max_score}`
                      : ""}
                  </td>
                  <td>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span className={getStatusClass(item.status)}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecentEvaluations;
