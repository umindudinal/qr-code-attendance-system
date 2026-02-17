const StatCard = ({ label, value, hint }) => {
  return (
    <div className="card stat-card">
      <p className="stat-card__label">{label}</p>
      <h3 className="stat-card__value">{value}</h3>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </div>
  )
}

export default StatCard
