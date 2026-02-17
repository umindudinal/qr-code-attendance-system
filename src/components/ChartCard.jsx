const ChartCard = ({ title, children, subtitle }) => {
  return (
    <section className="card chart-card">
      <div className="chart-card__header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="chart-card__body">{children}</div>
    </section>
  )
}

export default ChartCard
