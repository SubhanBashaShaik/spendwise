import { useState } from 'react'

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Housing', 'Utilities', 'Education', 'Travel', 'Other'
]

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function ExpenseForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: today(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!form.date) {
      setError('Please select a date')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onSubmit({
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
      })
    } catch (e) {
      setError(e.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          animation: 'fadeUp 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>
            New Expense
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: 20, padding: 4 }}
          >×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16,
              }}>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={set('amount')}
                autoFocus
                style={{ ...inputStyle, paddingLeft: 28, fontFamily: 'var(--font-mono)', fontSize: 16 }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={set('category')} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(optional)</span></label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={form.description}
              onChange={set('description')}
              style={inputStyle}
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              max={today()}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--red)', fontSize: 13, background: 'var(--red-dim)', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? 'rgba(74,222,128,0.4)' : 'var(--accent)',
                color: '#000',
                fontWeight: 600,
                fontSize: 15,
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  color: 'var(--text)',
  fontSize: 14,
  transition: 'border-color 0.15s',
}

const secondaryBtnStyle = {
  flex: '0 0 90px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text-dim)',
  fontWeight: 500,
  fontSize: 14,
  padding: '12px',
  borderRadius: 'var(--radius-sm)',
}
