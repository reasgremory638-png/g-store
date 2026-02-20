import './StatsCards.css'

export default function StatsCards({ activeCount, ordersCount, totalSales }) {
  const stats = [
    {
      label: 'المنتجات النشطة',
      value: activeCount,
      icon: 'fa-boxes-stacked',
      border: '#f2ba49'
    },
    {
      label: 'إجمالي الطلبات',
      value: ordersCount,
      icon: 'fa-receipt',
      border: '#22c55e'
    },
    {
      label: 'إجمالي المبيعات',
      value: totalSales.toLocaleString() + ' د.ع',
      icon: 'fa-sack-dollar',
      border: '#3b82f6'
    }
  ]

  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={i} className="stat-card" style={{ borderRightColor: s.border }}>
          <div className="stat-icon" style={{ color: s.border }}>
            <i className={`fa-solid ${s.icon}`} />
          </div>
          <div>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
