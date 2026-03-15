import { useState } from 'react'

const CATEGORY_COLORS = {
  'Food': '#4ade80', 'Transport': '#60a5fa', 'Shopping': '#f472b6',
  'Entertainment': '#a78bfa', 'Health': '#fb923c', 'Housing': '#fbbf24',
  'Utilities': '#34d399', 'Education': '#38bdf8', 'Travel': '#e879f9', 'Other': '#94a3b8',
}

function getColor(cat) { return CATEGORY_COLORS[cat] || '#94a3b8' }

const EMOJI_MAP = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Health: '💊', Housing: '🏠', Utilities: '⚡', Education: '📚',
  Travel: '✈️', Other: '📦'
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
}

function groupByDate(expenses) {
  const groups = {}
  expenses.forEach(e => {
    const d = e.date
    if (!groups[d]) groups[d] = []
    groups[d].push(e)
  })
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function formatDateLabel(d) {
  const date = new Date(d + 'T00:00:00')
  const today = new Date()
  today.setHours(0,0,0,0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function ExpenseList({ expenses, onDelete, onAdd }) {
  const [deletingId, setDeletingId] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...new Set(expenses.map(e => e.category))]

  const filtered = filter === 'All' ? expenses : expenses.filter(e => e.category === filter)
  const grouped = groupByDate(filtered)

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">

      {/* Category filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 500,
              background: filter === cat ? 'var(--accent)' : 'var(--surface)',
              color: filter === cat ? '#000' : 'var(--text-dim)',
              border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expense groups */}
      {grouped.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 60,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text-dim)', marginBottom: 8 }}>
            No expenses yet
          </div>
          <div style={{ fontSize: 14, marginBottom: 20 }}>Start tracking your spending</div>
          <button
            onClick={onAdd}
            style={{
              background: 'var(--accent)',
              color: '#000',
              fontWeight: 600,
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            + Add First Expense
          </button>
        </div>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {formatDateLabel(date)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                {fmt(items.reduce((s, e) => s + e.amount, 0))}
              </span>
            </div>

            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              {items.map((expense, idx) => (
                <div
                  key={expense.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: deletingId === expense.id ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, flexShrink: 0,
                    borderRadius: 10,
                    background: `${getColor(expense.category)}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {EMOJI_MAP[expense.category] || '📦'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {expense.description || expense.category}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                      <span style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 100,
                        background: `${getColor(expense.category)}15`,
                        color: getColor(expense.category),
                        fontWeight: 500,
                      }}>
                        {expense.category}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: 15,
                    color: 'var(--red)',
                    whiteSpace: 'nowrap',
                  }}>
                    -{fmt(expense.amount)}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    style={{
                      background: 'none',
                      color: 'var(--text-muted)',
                      fontSize: 16,
                      padding: '4px 6px',
                      borderRadius: 6,
                      transition: 'color 0.15s, background 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.target.style.color = 'var(--red)'; e.target.style.background = 'var(--red-dim)' }}
                    onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none' }}
                    title="Delete expense"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
