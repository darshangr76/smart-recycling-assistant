"""
LLM-as-judge quality evaluation for Person 2 tips.
Scores each tip on specificity, actionability, correctness (1-5).
Flags low-scorers for review.
"""

import json
import re
import time
from pathlib import Path

import requests

from waste_items import all_items, get_category, get_fallback_tip
from person2_ai import generate_tip

OLLAMA_URL = "http://localhost:11434/api/generate"
JUDGE_MODEL = "qwen2.5-coder:3b"
RESULTS_DIR = Path("benchmark_results")
RESULTS_DIR.mkdir(exist_ok=True)

# Sample 20 items across categories for speed
SAMPLE = [
    "plastic bottle", "aluminum can", "glass jar", "cardboard box", "newspaper",
    "banana peel", "coffee grounds", "apple core", "egg shells", "grass clippings",
    "battery", "paint can", "medicine", "motor oil", "light bulb",
    "t-shirt", "mason jar", "book", "backpack", "wine cork",
]

JUDGE_PROMPT = """You are a waste-disposal expert evaluating tips.

Item: {item}
Expected category: {category}
Rule-based reference tip: {reference}
AI-generated tip: {tip}

Rate the AI tip on 3 criteria from 1 (bad) to 5 (excellent):
1. SPECIFICITY: Does it name a specific bin/place or method? (1=generic, 5=very specific)
2. ACTIONABILITY: Does it tell the user exactly what to do? (1=vague, 5=clear action)
3. CORRECTNESS: Is it factually correct? (1=wrong, 5=correct)

Respond in this EXACT format, nothing else:
SPECIFICITY: <number>
ACTIONABILITY: <number>
CORRECTNESS: <number>
REASON: <one sentence>
"""


def parse_scores(text: str) -> dict:
    """Extract scores from judge response."""
    out = {"specificity": None, "actionability": None, "correctness": None, "reason": ""}
    for key in ("SPECIFICITY", "ACTIONABILITY", "CORRECTNESS"):
        m = re.search(rf"{key}:\s*(\d)", text, re.IGNORECASE)
        if m:
            out[key.lower()] = int(m.group(1))
    m = re.search(r"REASON:\s*(.+)", text, re.IGNORECASE)
    if m:
        out["reason"] = m.group(1).strip()[:200]
    return out


def judge(item: str, tip: str) -> dict:
    cat = get_category(item)
    reference = get_fallback_tip(item)
    prompt = JUDGE_PROMPT.format(item=item, category=cat, reference=reference, tip=tip)
    try:
        r = requests.post(OLLAMA_URL, json={
            "model": JUDGE_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.0, "num_predict": 120},
        }, timeout=60)
        r.raise_for_status()
        data = r.json()
        raw = (data.get("response") or "").strip()
        if not raw and data.get("thinking"):
            raw = data["thinking"]
        return parse_scores(raw)
    except Exception as e:
        return {"specificity": None, "actionability": None, "correctness": None, "reason": str(e)}


def main():
    print(f"Evaluating {len(SAMPLE)} items...\n")

    rows = []
    for i, item in enumerate(SAMPLE, 1):
        tip = generate_tip(item)
        scores = judge(item, tip)
        avg = None
        if scores["specificity"] and scores["actionability"] and scores["correctness"]:
            avg = (scores["specificity"] + scores["actionability"] + scores["correctness"]) / 3
        rows.append({"item": item, "tip": tip, "scores": scores, "avg": avg})

        flag = "OK " if avg and avg >= 4.0 else "LOW"
        avg_str = f"{avg:.1f}" if avg else "?"
        print(f"[{i:2d}/{len(SAMPLE)}] {flag} {item:20s} avg={avg_str}  "
              f"S={scores['specificity']} A={scores['actionability']} C={scores['correctness']}")

    valid = [r for r in rows if r["avg"] is not None]
    overall_avg = sum(r["avg"] for r in valid) / len(valid) if valid else 0
    low_quality = [r for r in valid if r["avg"] < 3.5]

    summary = {
        "items_evaluated": len(rows),
        "items_scored": len(valid),
        "overall_avg_score": round(overall_avg, 2),
        "low_quality_count": len(low_quality),
        "low_quality_items": [r["item"] for r in low_quality],
        "rows": rows,
    }

    (RESULTS_DIR / "quality_eval.json").write_text(json.dumps(summary, indent=2))

    print(f"\n{'='*60}")
    print("QUALITY SUMMARY")
    print(f"{'='*60}")
    print(f"Items evaluated:     {len(rows)}")
    print(f"Overall avg score:   {overall_avg:.2f} / 5.00")
    print(f"Low quality (<3.5):  {len(low_quality)} items")
    if low_quality:
        print("\nNeeds review:")
        for r in low_quality:
            print(f"  - {r['item']:20s} avg={r['avg']:.1f}")
            print(f"    Tip: {r['tip'][:100]}")
            print(f"    Reason: {r['scores']['reason']}")
    print(f"\nSaved: benchmark_results/quality_eval.json")


if __name__ == "__main__":
    main()
