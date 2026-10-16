"""Digital Twin dashboard aggregator."""
import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter

FLOW_FILE = Path("material_flow.json")


def load_log():
    if not FLOW_FILE.exists():
        return []
    try:
        return json.loads(FLOW_FILE.read_text())
    except Exception:
        return []


def summary():
    log = load_log()
    if not log:
        return {"total_items": 0, "by_category": {}, "top_labels": []}
    by_cat = Counter(e.get("category", "Unknown") for e in log)
    top_labels = Counter(e.get("label", "?") for e in log).most_common(5)
    now = datetime.now()
    week_ago = (now - timedelta(days=7)).isoformat()
    this_week = [e for e in log if e.get("timestamp", "") >= week_ago]
    return {
        "total_items": len(log),
        "this_week": len(this_week),
        "by_category": dict(by_cat),
        "top_labels": top_labels,
    }


def impact_score():
    log = load_log()
    rec = sum(1 for e in log if e.get("category") == "Recyclable")
    bio = sum(1 for e in log if e.get("category") == "Biodegradable")
    haz = sum(1 for e in log if e.get("category") == "Hazardous")
    reu = sum(1 for e in log if e.get("category") == "Reusable")
    return {
        "items_recycled": rec,
        "items_composted": bio,
        "hazardous_diverted": haz,
        "items_reused": reu,
        "est_co2_saved_g": rec * 150 + reu * 500 + bio * 20,
    }


if __name__ == "__main__":
    s = summary()
    print("=" * 60)
    print("DIGITAL TWIN SUMMARY")
    print("=" * 60)
    print(f"Total items tracked:  {s['total_items']}")
    print(f"This week:            {s.get('this_week', 0)}")
    print("\nBy category:")
    for cat, n in s["by_category"].items():
        print(f"  {cat:15s}: {n}")
    print("\nTop 5 items:")
    for label, n in s["top_labels"]:
        print(f"  {label:22s}: {n}")
    print("\nImpact estimate:")
    for k, v in impact_score().items():
        print(f"  {k:22s}: {v}")
