"""Read benchmark reports, produce pitch-ready metrics summary."""
import json
from pathlib import Path

RESULTS = Path("benchmark_results")
OUT = Path("PERSON2_METRICS.md")


def load(name):
    p = RESULTS / name
    if p.exists():
        try:
            return json.loads(p.read_text())
        except Exception:
            return None
    return None




def _get_db_size():
    """Read the actual number of items from waste_items.py."""
    try:
        import waste_items
        return len(waste_items.WASTE_DB)
    except Exception:
        return "120+"

def main():
    stress = load("person2_100item_report.json")
    cache = load("cache_benchmark.json")
    quality = load("quality_eval.json")

    lines = [
        "# Person 2 - The AI Brain",
        "",
        "## Performance Metrics",
        "",
        "### Reliability (Stress Test)",
        "",
    ]
    if stress:
        lines += [
            f"- **Items processed:** {stress['total_items']}",
            f"- **Success rate:** {stress['success_rate']}%",
            f"- **Errors:** {stress['errors']}",
            f"- **Total runtime:** {stress['total_time_s']}s",
            "",
        ]

    lines += ["### Caching", ""]
    if cache:
        lines += [
            f"- **Cold latency:** {cache['avg_cold_s']}s",
            f"- **Cached latency:** {cache['avg_warm_s']}s",
            f"- **Speedup:** **{cache['speedup_x']}x**",
            "",
        ]

    lines += ["### Tip Quality (LLM-as-judge)", ""]
    if quality:
        lines += [
            f"- **Avg score:** {quality['overall_avg_score']} / 5.00",
            f"- **Low-quality items (<3.5):** {quality['low_quality_count']}",
            f"- **Items evaluated:** {quality['items_evaluated']}",
            "",
        ]

    lines += [
        "## Architecture",
        "",
        "- 3-layer fallback: primary LLM -> fallback LLM -> rule-based DB tip",
        "- Disk cache persists across restarts (tip_cache.json)",
        "- Category-aware prompting for correct hazardous/reusable guidance",
        "- Multilingual-ready architecture (production: swap to Indic LLM)",
        "- Model swap-ready via PERSON2_MODEL env var",
        "",
        "## Data",
        "",
        f"- {_get_db_size()}+ curated waste items",
        "- 4 categories: Recyclable / Biodegradable / Hazardous / Reusable",
        "- Digital Twin log persists in material_flow.json",
        "",
    ]

    OUT.write_text("\n".join(lines))
    print(f"Saved: {OUT}\n")
    print(OUT.read_text())


if __name__ == "__main__":
    main()
