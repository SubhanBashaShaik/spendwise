import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard.jsx'
import ExpenseForm from './components/ExpenseForm.jsx'
import ExpenseList from './components/ExpenseList.jsx'

const API = '/api'

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(m) {
  const [y, mo] = m.split('-')
  return new Date(y, mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function App() {
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState(null)
  const [month, setMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [expRes, statRes] = await Promise.all([
        fetch(`${API}/expenses?month=${month}`),
        fetch(`${API}/stats?month=${month}`)
      ])
      if (!expRes.ok || !statRes.ok) throw new Error('Failed to fetch data')
      const [expData, statData] = await Promise.all([expRes.json(), statRes.json()])
      setExpenses(expData)
      setStats(statData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddExpense = async (data) => {
    try {
      const res = await fetch(`${API}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to add expense')
      setShowForm(false)
      await fetchData()
    } catch (e) {
      throw e
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/expenses/${id}`, { method: 'DELETE' })
      await fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const changeMonth = (delta) => {
    const [y, m] = month.split('-').map(Number)
    let nm = m + delta
    let ny = y
    if (nm > 12) { nm = 1; ny++ }
    if (nm < 1) { nm = 12; ny-- }
    setMonth(`${ny}-${String(nm).padStart(2, '0')}`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        background: 'rgba(8,10,14,0.9)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 16,
            color: '#000',
          }}>S</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
            SpendWise
          </span>
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => changeMonth(-1)} style={navBtnStyle}>←</button>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--text-dim)',
            minWidth: 130,
            textAlign: 'center',
          }}>
            {formatMonth(month)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            disabled={month >= getCurrentMonth()}
            style={{ ...navBtnStyle, opacity: month >= getCurrentMonth() ? 0.3 : 1 }}
          >→</button>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          + Add Expense
        </button>
      </header>

      {/* Tab nav */}
      <div style={{
        display: 'flex',
        gap: 2,
        padding: '12px 24px 0',
        borderBottom: '1px solid var(--border)',
      }}>
        {['dashboard', 'transactions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              background: 'none',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 14,
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 0,
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        {error && (
          <div style={{
            background: 'var(--red-dim)',
            border: '1px solid var(--red)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            color: 'var(--red)',
            marginBottom: 20,
            fontSize: 14,
          }}>
            ⚠ {error} — Check your Supabase credentials in Vercel env vars.
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard stats={stats} expenses={expenses} month={month} />
            )}
            {activeTab === 'transactions' && (
              <ExpenseList
                expenses={expenses}
                onDelete={handleDelete}
                onAdd={() => setShowForm(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Modal form */}
      {showForm && (
        <ExpenseForm
          onSubmit={handleAddExpense}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

const navBtnStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-dim)',
  width: 32,
  height: 32,
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'border-color 0.15s',
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          height: 80,
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          animation: 'pulse 1.5s infinite',
        }} />
      ))}
    </div>
  )
}
