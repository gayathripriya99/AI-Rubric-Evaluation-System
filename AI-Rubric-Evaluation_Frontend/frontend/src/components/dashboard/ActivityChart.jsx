
function ActivityChart({ data = [], loading = false }) {
  const maxValue = Math.max(
    1,
    ...data.map((item) => Number(item.evaluations) || 0)
  );

  return (
    <section className="activity-chart">
      <div className="activity-chart-header">
        <div>
          <h2>Evaluation Activity</h2>
          <p>Number of evaluations completed over time</p>
        </div>

        <span className="chart-period">Last 7 days</span>
      </div>

      {loading ? (
        <div className="chart-empty">
          Loading activity data...
        </div>
      ) : data.length === 0 ? (
        <div className="chart-empty">
          <div className="chart-empty-icon">▥</div>
          <h3>No activity data yet</h3>
          <p>
            Your evaluation activity chart will appear
            when evaluation records become available.
          </p>
        </div>
      ) : (
        <div className="chart-area">
          <div className="chart-y-axis">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>

          <div className="chart-bars-area">
            <div className="chart-grid-lines">
              {[0, 1, 2, 3, 4].map((line) => (
                <div key={line} className="chart-grid-line" />
              ))}
            </div>

            <div className="chart-bars">
              {data.map((item, index) => {
                const value = Math.max(
                  0,
                  Number(item.evaluations) || 0
                );

                const height = (value / maxValue) * 100;

                return (
                  <div className="chart-bar-group" key={item.label || index}>
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{ height: `${height}%` }}
                        title={`${value} evaluations`}
                      />
                    </div>

                    <span className="chart-bar-label">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ActivityChart;
