"""
Benchmark qwen3-vl on the 60-image test set.
Scoring: CATEGORY-LEVEL (Recyclable / Biodegradable / Hazardous / Reusable)
"""

import json
import time
from pathlib import Path
from collections import defaultdict

from person1_vision import classify_path
from person2_ai import _categorize

IMAGES = Path("benchmark_data/images")
LABELS = json.loads(Path("benchmark_data/labels.json").read_text())
RESULTS = Path("benchmark_results")
RESULTS.mkdir(exist_ok=True)


def main():
    rows = []
    correct = 0
    total = 0
    per_class = defaultdict(lambda: {"correct": 0, "total": 0})
    start = time.time()

    print(f"Benchmarking {len(LABELS)} images with qwen3-vl:4b...\n")

    for i, (fname, truth) in enumerate(LABELS.items(), 1):
        img_path = IMAGES / fname
        t0 = time.time()
        predicted_raw = classify_path(str(img_path))
        latency = time.time() - t0

        predicted_cat = _categorize(predicted_raw) or "Unknown"
        expected_cat = truth["expected_category"]
        is_correct = predicted_cat == expected_cat

        correct += int(is_correct)
        total += 1
        per_class[truth["trashnet_class"]]["total"] += 1
        per_class[truth["trashnet_class"]]["correct"] += int(is_correct)

        rows.append({
            "file": fname,
            "expected_label": truth["expected_label"],
            "expected_category": expected_cat,
            "predicted_raw": predicted_raw,
            "predicted_category": predicted_cat,
            "correct": is_correct,
            "latency_s": round(latency, 2),
        })

        icon = "OK " if is_correct else "XX "
        print(f"[{i:2d}/{total}] {icon} {fname:22s} pred='{predicted_raw}' -> {predicted_cat} (want {expected_cat}, {latency:.1f}s)")

    elapsed = time.time() - start
    accuracy = correct / total if total else 0

    (RESULTS / "results.json").write_text(json.dumps({
        "accuracy": accuracy,
        "correct": correct,
        "total": total,
        "elapsed_s": round(elapsed, 1),
        "per_class": dict(per_class),
        "rows": rows,
    }, indent=2))

    md = [
        "# Vision Benchmark Results",
        "",
        f"**Model:** qwen3-vl:4b (Ollama)",
        f"**Test set:** {total} images (TrashNet, 10 per class)",
        f"**Scoring:** Category-level (Recyclable/Biodegradable/Hazardous/Reusable)",
        f"**Accuracy:** **{accuracy*100:.1f}%** ({correct}/{total})",
        f"**Avg latency:** {elapsed/total:.2f}s/image",
        "",
        "## Per-class breakdown",
        "",
        "| TrashNet class | Correct | Total | Accuracy |",
        "|----------------|--------:|------:|---------:|",
    ]
    for cls, s in sorted(per_class.items()):
        acc = s["correct"] / s["total"] * 100 if s["total"] else 0
        md.append(f"| {cls} | {s['correct']} | {s['total']} | {acc:.0f}% |")

    (RESULTS / "results.md").write_text("\n".join(md))

    print(f"\nAccuracy: {accuracy*100:.1f}% ({correct}/{total})")
    print(f"Total time: {elapsed:.1f}s ({elapsed/total:.2f}s/image)")
    print(f"Saved: benchmark_results/results.md")


if __name__ == "__main__":
    main()
