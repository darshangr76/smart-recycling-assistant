"""
Prove the cache speedup with a controlled experiment.
Produces a screenshot-ready report.
"""

import json
import time
from pathlib import Path

import person2_ai
from person2_ai import generate_tip

RESULTS_DIR = Path("benchmark_results")
RESULTS_DIR.mkdir(exist_ok=True)

# 10 fresh items likely not in cache
TEST_ITEMS = [
    "rusty nail",
    "broken pencil",
    "stained carpet",
    "old sponge",
    "dried paint brush",
    "cracked flowerpot",
    "torn envelope",
    "empty ink pen",
    "worn sandal",
    "used candle",
]


def clear_all_caches():
    """Clear both LRU and disk cache."""
    person2_ai.generate_tip.cache_clear()
    cache_file = Path("tip_cache.json")
    if cache_file.exists():
        cache = json.loads(cache_file.read_text())
        # Remove test items from disk cache
        for item in TEST_ITEMS:
            cache.pop(f"en::{item}", None)
        cache_file.write_text(json.dumps(cache, indent=2, ensure_ascii=False))


def main():
    print("=" * 60)
    print("CACHE BENCHMARK")
    print("=" * 60)

    # ── Phase 1: Cold (LLM call) ────────────────────────────
    print("\nPhase 1: Cold starts (clearing cache between each)...")
    clear_all_caches()
    cold_times = []
    for item in TEST_ITEMS:
        person2_ai.generate_tip.cache_clear()
        t0 = time.time()
        generate_tip(item)
        dt = time.time() - t0
        cold_times.append(dt)
        print(f"  {item:25s} {dt:.3f}s")

    # ── Phase 2: Warm (disk cache hit) ──────────────────────
    print("\nPhase 2: Warm starts (cache hit)...")
    person2_ai.generate_tip.cache_clear()
    warm_times = []
    for item in TEST_ITEMS:
        person2_ai.generate_tip.cache_clear()
        t0 = time.time()
        generate_tip(item)
        dt = time.time() - t0
        warm_times.append(dt)
        print(f"  {item:25s} {dt:.4f}s")

    # ── Summary ─────────────────────────────────────────────
    avg_cold = sum(cold_times) / len(cold_times)
    avg_warm = sum(warm_times) / len(warm_times)
    speedup = avg_cold / max(avg_warm, 0.0001)

    summary = {
        "test_items": len(TEST_ITEMS),
        "avg_cold_s": round(avg_cold, 3),
        "avg_warm_s": round(avg_warm, 4),
        "speedup_x": round(speedup, 1),
        "cold_times": [round(t, 3) for t in cold_times],
        "warm_times": [round(t, 4) for t in warm_times],
    }

    (RESULTS_DIR / "cache_benchmark.json").write_text(json.dumps(summary, indent=2))

    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"Test items:          {len(TEST_ITEMS)}")
    print(f"Avg cold latency:    {avg_cold:.3f}s")
    print(f"Avg warm latency:    {avg_warm:.4f}s")
    print(f"Cache speedup:       {speedup:.1f}x")
    print(f"\nSaved: benchmark_results/cache_benchmark.json")


if __name__ == "__main__":
    main()
