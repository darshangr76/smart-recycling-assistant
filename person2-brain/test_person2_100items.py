"""
Stress test: run all waste items through generate_tip() + track_item().
"""

import json
import time
from pathlib import Path
from collections import Counter

from waste_items import all_items, get_category
from person2_ai import generate_tip, track_item, get_stats

RESULTS_DIR = Path("benchmark_results")
RESULTS_DIR.mkdir(exist_ok=True)


def main():
    Path("material_flow.json").write_text("[]")

    items = all_items()
    print(f"Running {len(items)} items through Person 2...\n")

    results = []
    errors = 0
    t_start = time.time()

    for i, item in enumerate(items, 1):
        try:
            t0 = time.time()
            tip = generate_tip(item)
            latency = time.time() - t0
            track_item(item)
            results.append({
                "item": item,
                "category": get_category(item),
                "tip": tip,
                "latency_s": round(latency, 2),
                "error": None,
            })
            status = "OK"
        except Exception as e:
            errors += 1
            results.append({
                "item": item,
                "category": get_category(item),
                "tip": None,
                "latency_s": None,
                "error": str(e),
            })
            status = f"ERR ({e})"

        if i % 10 == 0 or i == len(items):
            print(f"  [{i:3d}/{len(items)}] last: {item:22s} {status}")

    total_time = time.time() - t_start
    latencies = [r["latency_s"] for r in results if r["latency_s"] is not None]

    cold = latencies[:10]
    warm = latencies[10:]

    stats = get_stats()
    cat_dist = Counter(r["category"] for r in results)

    report = {
        "total_items": len(items),
        "errors": errors,
        "success_rate": round((len(items) - errors) / len(items) * 100, 1),
        "total_time_s": round(total_time, 1),
        "avg_cold_latency_s": round(sum(cold) / len(cold), 2) if cold else None,
        "avg_warm_latency_s": round(sum(warm) / len(warm), 3) if warm else None,
        "cache_speedup": round(
            (sum(cold) / len(cold)) / max(sum(warm) / len(warm), 0.001), 1
        ) if cold and warm else None,
        "category_distribution": dict(cat_dist),
        "digital_twin_stats": stats,
    }

    (RESULTS_DIR / "person2_100item_report.json").write_text(json.dumps(report, indent=2))
    (RESULTS_DIR / "person2_100item_details.json").write_text(json.dumps(results, indent=2))

    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"Items processed:     {len(items)}")
    print(f"Errors:              {errors}")
    print(f"Success rate:        {report['success_rate']}%")
    print(f"Total time:          {report['total_time_s']}s")
    print(f"Avg cold latency:    {report['avg_cold_latency_s']}s")
    print(f"Avg warm (cached):   {report['avg_warm_latency_s']}s")
    print(f"Cache speedup:       {report['cache_speedup']}x")
    print(f"\nCategory distribution:")
    for cat, n in sorted(cat_dist.items()):
        print(f"  {cat:15s}: {n}")
    print(f"\nSaved: benchmark_results/person2_100item_report.json")


if __name__ == "__main__":
    main()
