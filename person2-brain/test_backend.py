"""
Integration test for backend.py and the FastAPI pipeline.
Runs 40+ assertions across label classification, image classification,
health checks, and error handling.
"""

import io
import base64
from pathlib import Path

from backend import classify_label_only, classify_and_tip, health

PASS = 0
FAIL = 0


def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name}  {detail}")


# ─── 1. Label pipeline (15 items) ───────────────────────────
def test_label_pipeline():
    print("\n[1] Label pipeline — 15 items")

    test_cases = [
        ("battery", "Hazardous"),
        ("banana peel", "Biodegradable"),
        ("plastic bottle", "Recyclable"),
        ("t-shirt", "Reusable"),
        ("paint can", "Hazardous"),
        ("coffee grounds", "Biodegradable"),
        ("aluminum can", "Recyclable"),
        ("book", "Reusable"),
        ("light bulb", "Hazardous"),
        ("apple core", "Biodegradable"),
        ("cardboard box", "Recyclable"),
        ("mason jar", "Reusable"),
        ("motor oil", "Hazardous"),
        ("egg shells", "Biodegradable"),
        ("newspaper", "Recyclable"),
    ]

    for label, expected_cat in test_cases:
        r = classify_label_only(label)
        check(f"{label} → {expected_cat}",
              r["success"] and r["category"] == expected_cat,
              f"got {r['category']}")
        check(f"{label} tip non-empty",
              r["tip"] and len(r["tip"]) > 10)


# ─── 2. Image pipeline (5 TrashNet images) ──────────────────
def test_image_pipeline():
    print("\n[2] Image pipeline — 5 images")

    from PIL import Image

    sample_dir = Path("benchmark_data/images")
    if not sample_dir.exists():
        print("  SKIP  benchmark_data/images missing")
        return

    samples = list(sample_dir.glob("*.jpg"))[:5]
    for img_path in samples:
        try:
            image = Image.open(img_path).convert("RGB")
            r = classify_and_tip(image)
            check(f"{img_path.name} returns dict",
                  isinstance(r, dict) and "label" in r,
                  f"got keys: {list(r.keys())[:3]}")
            check(f"{img_path.name} has category",
                  r.get("category") is not None)
        except Exception as e:
            check(f"{img_path.name} no crash", False, str(e))


# ─── 3. Health check ────────────────────────────────────────
def test_health():
    print("\n[3] Health diagnostics")

    h = health()
    check("person2_available", h.get("person2_available") is True)
    check("items_in_db >= 4000", h.get("items_in_db", 0) >= 4000,
          f"got {h.get('items_in_db')}")
    check("rag_chunks >= 100", h.get("rag_chunks", 0) >= 100,
          f"got {h.get('rag_chunks')}")
    check("ollama_reachable", h.get("ollama_reachable") is True)


# ─── 4. Error handling ──────────────────────────────────────
def test_error_handling():
    print("\n[4] Error handling")

    # Empty label
    r = classify_label_only("")
    check("empty label handled", "success" in r)

    # Unknown label
    r = classify_label_only("xyzzyqwerty")
    check("unknown label returns dict", isinstance(r, dict))

    # Weird chars
    r = classify_label_only("!!!@#$%")
    check("special chars handled", isinstance(r, dict))


# ─── 5. Fallback (no image) ─────────────────────────────────
def test_fallback():
    print("\n[5] Fallback behavior")

    # Passing None as image should not crash
    try:
        r = classify_and_tip(None)
        check("None image doesn't crash", isinstance(r, dict))
    except Exception as e:
        check("None image doesn't crash", False, str(e))

    # Passing a string (wrong type)
    try:
        r = classify_and_tip("not an image")
        check("wrong type doesn't crash", isinstance(r, dict))
    except Exception as e:
        check("wrong type doesn't crash", False, str(e))


# ─── 6. Impact + stats sanity ───────────────────────────────
def test_stats_sanity():
    print("\n[6] Stats and impact sanity")

    r = classify_label_only("plastic bottle")
    check("stats has 4 categories",
          set(r["stats"].keys()) == {"Recyclable", "Biodegradable", "Hazardous", "Reusable"})
    check("impact has co2_avoided_kg",
          "co2_avoided_kg" in r["impact"])
    check("impact has equivalences",
          "equivalences" in r["impact"])


# ─── Main ───────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("BACKEND INTEGRATION TESTS")
    print("=" * 60)

    test_label_pipeline()
    test_image_pipeline()
    test_health()
    test_error_handling()
    test_fallback()
    test_stats_sanity()

    print("\n" + "=" * 60)
    print(f"Results: {PASS} passed, {FAIL} failed")
    print("=" * 60)
    return 0 if FAIL == 0 else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
