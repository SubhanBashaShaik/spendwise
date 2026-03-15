import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS = {
  'Food': '#4ade80',
  'Transport': '#60a5fa',
  'Shopping': '#f472b6',
  'Entertainment': '#a78bfa',
  'Health': '#fb923c',
  'Housing': '#fbbf24',
  'Utilities': '#34d399',
  'Education': '#38bdf8',
  'Travel': '#e879f9',
  'Other': '#94a3b8',
}

function getColor(cat) {
  return CATEGORY_COLORS[cat] || '#94a3b8'
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0)
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: 2 }}>{name}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmt(value)}</div>
    </div>
  )
}

export default function Dashboard({ stats, expenses, month }) {
  if (!stats) return null

  const categoryData = Object.entries(stats.by_category || {}).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2))
  }))

  // Build daily spending for bar chart (last 15 days of month or current data)
  const dailyMap = {}
  expenses.forEach(e => {
    const day = e.date.slice(8, 10)
    dailyMap[day] = (dailyMap[day] || 0) + e.amount
  })
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, amount]) => ({ day: day.replace(/^0/, ''), amount: Number(amount.toFixed(2)) }))

  const avgPerDay = stats.count > 0
    ? (stats.total / Object.keys(dailyMap).length).toFixed(2)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          label="Total Spent"
          value={fmt(stats.total)}
          mono
          accent
          icon="💸"
        />
        <StatCard
          label="Transactions"
          value={stats.count}
          icon="🧾"
        />
        <StatCard
          label="Avg / Day"
          value={fmt(avgPerDay)}
          mono
          icon="📅"
        />
        <StatCard
          label="Categories"
          value={Object.keys(stats.by_category || {}).length}
          icon="🏷️"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
        {/* Pie chart */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>By Category</span>
          </div>
          {categoryData.length === 0 ? (
            <EmptyState message="No expenses yet" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={getColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {categoryData.slice(0, 5).map(({ name, value }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(name), flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
                      {fmt(value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar chart - daily */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Daily Spending</span>
          </div>
          {dailyData.length === 0 ? (
            <EmptyState message="No data for this month" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-dim)' }} />
                <Bar dataKey="amount" name="Amount" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent expenses */}
      {expenses.length > 0 && (
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Recent Expenses</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {expenses.slice(0, 5).map((e, i) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < 4 && i < expenses.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 8,
                    background: `${getColor(e.category)}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {categoryEmoji(e.category)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{e.description || e.category}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {e.category} · {e.date}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--red)',
                }}>
                  -{fmt(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, mono, accent, icon }) {
  return (
    <div style={{
      ...cardStyle,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
        color: accent ? 'var(--accent)' : 'var(--text)',
        letterSpacing: mono ? '-1px' : '-0.5px',
      }}>
        {value}
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div style={{
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: 14,
    }}>
      {message}
    </div>
  )
}

function categoryEmoji(cat) {
  const map = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️',
    Entertainment: '🎬', Health: '💊', Housing: '🏠',
    Utilities: '⚡', Education: '📚', Travel: '✈️', Other: '📦'
  }
  return map[cat] || '📦'
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '20px 24px',
}

const cardHeader = {
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 15,
  color: 'var(--text)',
}
