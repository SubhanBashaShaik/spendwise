# 💸 SpendWise — Personal Expense Tracker

A full-stack expense tracker built with React + FastAPI + Supabase. Track your spending, visualize categories, and monitor monthly trends.

## Stack
- **Frontend**: React 18 + Vite + Recharts
- **Backend**: Python FastAPI (Vercel serverless)
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel

---

## 🚀 Deploy in 4 Steps

### Step 1 — Set up Supabase (5 min, free)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `spendwise`, pick a region, set a DB password
3. Once created, go to **SQL Editor** and run this:

```sql
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: index for faster queries
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
```

4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_KEY`

---

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/spendwise.git
git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Before deploying, click **Environment Variables** and add:
   ```
   SUPABASE_URL = https://your-project-id.supabase.co
   SUPABASE_KEY = your-anon-public-key
   ```
4. Click **Deploy** ✅

---

### Step 4 — Done!

Your app is live at `https://spendwise-xxx.vercel.app`

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+

### Frontend
```bash
npm install
npm run dev
# Runs at http://localhost:5173
```

### Backend (separate terminal)
```bash
cd api
pip install -r requirements.txt
# Copy .env.example to .env.local and fill in your Supabase credentials
uvicorn index:app --reload --port 8000
```

---

## 📁 Project Structure

```
spendwise/
├── api/
│   ├── index.py          # FastAPI app (all endpoints)
│   └── requirements.txt  # Python dependencies
├── src/
│   ├── App.jsx           # Main app, state, month navigation
│   ├── index.css         # Global styles + CSS variables
│   └── components/
│       ├── Dashboard.jsx  # Stats cards + Recharts pie/bar
│       ├── ExpenseForm.jsx # Add expense modal
│       └── ExpenseList.jsx # Transaction list, filters, delete
├── index.html
├── package.json
├── vite.config.js
├── vercel.json            # Routing: React → static, /api/* → FastAPI
└── .env.example
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/expenses` | List expenses (filter: `?month=YYYY-MM&category=Food`) |
| POST | `/api/expenses` | Create expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/stats` | Summary stats (filter: `?month=YYYY-MM`) |

---

## 🎨 Features

- ✅ Add/delete expenses with amount, category, description, date
- ✅ Dashboard with total, count, avg/day stats
- ✅ Pie chart — spending by category
- ✅ Bar chart — daily spending trend
- ✅ Transactions view with category filter chips
- ✅ Month-by-month navigation
- ✅ Dark fintech UI

---

## 🛠 Extending the App

Some ideas for features you can add:
- **Budget limits** per category (add a `budgets` table)
- **CSV export** (frontend: convert expenses array to CSV)
- **Multiple currencies** (add `currency` field)
- **Auth** (Supabase Auth — add user_id to expenses table)
- **Recurring expenses** (add `is_recurring` + `recurrence` fields)
