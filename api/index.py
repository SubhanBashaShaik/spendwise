from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum
from supabase import create_client, Client
import os
from typing import Optional

app = FastAPI(title="SpendWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured")
    return create_client(url, key)


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: str  # format: YYYY-MM-DD


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/expenses")
async def get_expenses(month: Optional[str] = None, category: Optional[str] = None):
    """List all expenses, optionally filtered by month (YYYY-MM) and/or category."""
    supabase = get_supabase()
    query = supabase.table("expenses").select("*").order("date", desc=True)

    if month:
        year, mon = month.split("-")
        # Next month for upper bound
        next_mon = int(mon) + 1
        next_year = int(year)
        if next_mon > 12:
            next_mon = 1
            next_year += 1
        upper = f"{next_year}-{next_mon:02d}-01"
        query = query.gte("date", f"{month}-01").lt("date", upper)

    if category and category != "All":
        query = query.eq("category", category)

    result = query.execute()
    return result.data


@app.post("/api/expenses", status_code=201)
async def create_expense(expense: ExpenseCreate):
    """Create a new expense."""
    if expense.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    supabase = get_supabase()
    data = {
        "amount": expense.amount,
        "category": expense.category,
        "description": expense.description or "",
        "date": expense.date,
    }
    result = supabase.table("expenses").insert(data).execute()
    return result.data[0]


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    """Delete an expense by ID."""
    supabase = get_supabase()
    supabase.table("expenses").delete().eq("id", expense_id).execute()
    return {"success": True}


@app.get("/api/stats")
async def get_stats(month: Optional[str] = None):
    """Get spending stats: total, count, and breakdown by category."""
    supabase = get_supabase()
    query = supabase.table("expenses").select("*")

    if month:
        year, mon = month.split("-")
        next_mon = int(mon) + 1
        next_year = int(year)
        if next_mon > 12:
            next_mon = 1
            next_year += 1
        upper = f"{next_year}-{next_mon:02d}-01"
        query = query.gte("date", f"{month}-01").lt("date", upper)

    result = query.execute()
    expenses = result.data

    total = sum(e["amount"] for e in expenses)
    by_category: dict = {}
    for e in expenses:
        cat = e["category"]
        by_category[cat] = round(by_category.get(cat, 0) + e["amount"], 2)

    # Sort categories by amount
    sorted_cats = sorted(by_category.items(), key=lambda x: x[1], reverse=True)

    return {
        "total": round(total, 2),
        "count": len(expenses),
        "by_category": dict(sorted_cats),
    }


# Vercel serverless handler
handler = Mangum(app, lifespan="off")
