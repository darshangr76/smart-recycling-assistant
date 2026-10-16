"""Analytics for the Digital Twin log. Produces chart-ready data."""

import json
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

FLOW_FILE = Path("material_flow.json")
CATS = ["Recyclable", "Biodegradable", "Hazardous", "Reusable"]


def load_log():
    if not FLOW_FILE.exists():
        return []
    try:
        return json.loads(FLOW_FILE.read_text())
    except Exception:
        return []


def daily_trend(days: int = 30) -> list:
    log = load_log()
    today = datetime.now().date()
    start = today - timedelta(days=days - 1)

    buckets = {}
    for i in range(days):
        d = (start + timedelta(days=i)).isoformat()
        buckets[d] = {"date": d, "total": 0, **{c: 0 for c in CATS}}

    for e in log:
        ts = e.get("timestamp", "")
        if not ts:
            continue
        day = ts[:10]
        if day in buckets:
            buckets[day]["total"] += 1
            cat = e.get("category")
            if cat in CATS:
                buckets[day][cat] += 1

    return list(buckets.values())


def weekly_totals(weeks: int = 4) -> list:
    log = load_log()
    today = datetime.now().date()
    this_monday = today - timedelta(days=today.weekday())
    out = []

    for w in range(weeks - 1, -1, -1):
        wk_start = this_monday - timedelta(weeks=w)
        wk_end = wk_start + timedelta(days=7)
        total = 0
        by_cat = {c: 0 for c in CATS}
        for e in log:
            ts = e.get("timestamp", "")
            if not ts:
                continue
            try:
                d = datetime.fromisoformat(ts).date()
            except Exception:
                continue
            if wk_start <= d < wk_end:
                total += 1
                cat = e.get("category")
                if cat in CATS:
                    by_cat[cat] += 1
        out.append({
            "week_start": wk_start.isoformat(),
            "total": total,
            "by_category": by_cat,
        })
    return out


def category_pie() -> dict:
    log = load_log()
    c = Counter(e.get("category") for e in log if e.get("category") in CATS)
    return {cat: c.get(cat, 0) for cat in CATS}


def top_items(n: int = 10) -> list:
    log = load_log()
    c = Counter(e.get("label", "?") for e in log)
    return c.most_common(n)


def streak_days() -> int:
    log = load_log()
    days_with_activity = set()
    for e in log:
        ts = e.get("timestamp", "")
        if ts:
            days_with_activity.add(ts[:10])

    today = datetime.now().date()
    streak = 0
    for i in range(365):
        d = (today - timedelta(days=i)).isoformat()
        if d in days_with_activity:
            streak += 1
        else:
            break
    return streak


def category_change() -> dict:
    weeks = weekly_totals(weeks=2)
    if len(weeks) < 2:
        return {c: 0 for c in CATS}
    last, this = weeks[0]["by_category"], weeks[1]["by_category"]
    return {c: this[c] - last[c] for c in CATS}


def summary_json() -> dict:
    return {
        "daily_trend": daily_trend(30),
        "weekly_totals": weekly_totals(4),
        "category_pie": category_pie(),
        "top_items": top_items(10),
        "streak_days": streak_days(),
        "category_change": category_change(),
    }


if __name__ == "__main__":
    s = summary_json()

    print("=" * 60)
    print("ANALYTICS SUMMARY")
    print("=" * 60)

    print(f"\nStreak: {s['streak_days']} consecutive days")
    print(f"\nCategory breakdown (all time):")
    for cat, n in s["category_pie"].items():
        print(f"  {cat:15s}: {n}")

    print(f"\nWeekly totals:")
    for w in s["weekly_totals"]:
        print(f"  Week of {w['week_start']}: {w['total']} items")

    print(f"\nTop 10 items:")
    for label, n in s["top_items"]:
        print(f"  {label:22s}: {n}")

    print(f"\nCategory change (this week vs last):")
    for cat, d in s["category_change"].items():
        sign = "+" if d > 0 else ""
        print(f"  {cat:15s}: {sign}{d}")

    print(f"\nLast 7 days trend (date, total):")
    for d in s["daily_trend"][-7:]:
        bar = "=" * d["total"]
        print(f"  {d['date']}  {d['total']:2d}  {bar}")
