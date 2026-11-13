
function StatCard({
  title,
  value = 0,
  description,
  icon,
  color = "blue",
}) {
  const colorClasses = {
    blue: "stat-icon-blue",
    green: "stat-icon-green",
    orange: "stat-icon-orange",
    red: "stat-icon-red",
  };

  const iconClass = colorClasses[color] || colorClasses.blue;

  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-info">
          <p className="stat-card-title">{title}</p>
          <h2 className="stat-card-value">
            {Number(value).toLocaleString()}
          </h2>
        </div>

        <div className={`stat-card-icon ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="stat-card-description">
        {description}
      </p>
    </article>
  );
}

export default StatCard;
