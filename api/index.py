from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import httpx

app = Flask(__name__)
CORS(app)


def get_headers():
    key = os.environ.get("SUPABASE_KEY", "")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def db_url(table):
    base = os.environ.get("SUPABASE_URL", "")
    return f"{base}/rest/v1/{table}"


def month_bounds(month):
    """Returns (start, end) date strings for a YYYY-MM month."""
    year, mon = month.split("-")
    next_mon = int(mon) + 1
    next_year = int(year)
    if next_mon > 12:
        next_mon = 1
        next_year += 1
    return f"{month}-01", f"{next_year}-{next_mon:02d}-01"


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "supabase_url_set": bool(os.environ.get("SUPABASE_URL")),
        "supabase_key_set": bool(os.environ.get("SUPABASE_KEY")),
    })


@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    month = request.args.get("month")
    category = request.args.get("category")

    # Build query string manually for correct PostgREST syntax
    query_params = [("select", "*"), ("order", "date.desc")]

    if month:
        start, end = month_bounds(month)
        query_params.append(("date", f"gte.{start}"))
        query_params.append(("date", f"lt.{end}"))

    if category and category != "All":
        query_params.append(("category", f"eq.{category}"))

    r = httpx.get(db_url("expenses"), headers=get_headers(), params=query_params)
    data = r.json()
    if not isinstance(data, list):
        return jsonify([]), 200
    return jsonify(data), 200


@app.route("/api/expenses", methods=["POST"])
def create_expense():
    data = request.get_json()
    if not data or float(data.get("amount", 0)) <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    payload = {
        "amount": float(data["amount"]),
        "category": data["category"],
        "description": data.get("description", ""),
        "date": data["date"],
    }

    r = httpx.post(db_url("expenses"), headers=get_headers(), json=payload)
    result = r.json()
    return jsonify(result[0] if isinstance(result, list) else result), 201


@app.route("/api/expenses/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    httpx.delete(
        db_url("expenses"),
        headers=get_headers(),
        params=[("id", f"eq.{expense_id}")]
    )
    return jsonify({"success": True}), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    month = request.args.get("month")
    query_params = [("select", "amount,category")]

    if month:
        start, end = month_bounds(month)
        query_params.append(("date", f"gte.{start}"))
        query_params.append(("date", f"lt.{end}"))

    r = httpx.get(db_url("expenses"), headers=get_headers(), params=query_params)
    expenses = r.json()

    if not isinstance(expenses, list):
        return jsonify({"total": 0, "count": 0, "by_category": {}}), 200

    total = sum(float(e["amount"]) for e in expenses)
    by_category = {}
    for e in expenses:
        cat = e["category"]
        by_category[cat] = round(by_category.get(cat, 0) + float(e["amount"]), 2)

    sorted_cats = sorted(by_category.items(), key=lambda x: x[1], reverse=True)

    return jsonify({
        "total": round(total, 2),
        "count": len(expenses),
        "by_category": dict(sorted_cats),
    })
