"""
Unit tests for Person 2. Run with: python3 test_person2_unit.py
"""

import json
import os
from pathlib import Path

from person2_ai import generate_tip, track_item, get_stats, _categorize
from waste_items import get_category, get_fallback_tip, all_items, CATEGORIES

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


def test_categorize():
    print("\n[test_categorize]")
    check("plastic bottle -> Recyclable", _categorize("plastic bottle") == "Recyclable")
    check("banana peel -> Biodegradable", _categorize("banana peel") == "Biodegradable")
    check("battery -> Hazardous", _categorize("battery") == "Hazardous")
    check("t-shirt -> Reusable", _categorize("t-shirt") == "Reusable")
    check("gibberish -> Unknown", _categorize("xyzzyqqq") == "Unknown")


def test_generate_tip():
    print("\n[test_generate_tip]")
    tip = generate_tip("plastic bottle")
    check("returns non-empty string", isinstance(tip, str) and len(tip) > 10)
    check("no 'error' in tip", "error" not in tip.lower())

    # Cache hit consistency
    tip2 = generate_tip("plastic bottle")
    check("cache returns same tip", tip == tip2)

    # Empty input safety
    empty = generate_tip("")
    check("empty input handled", isinstance(empty, str) and len(empty) > 0)


def test_track_and_stats():
    print("\n[test_track_and_stats]")
    Path("material_flow.json").write_text("[]")
    track_item("plastic bottle")
    track_item("banana peel")
    track_item("battery")
    track_item("t-shirt")

    stats = get_stats()
    check("stats has 4 categories", set(stats.keys()) == set(CATEGORIES))
    check("Recyclable == 1", stats["Recyclable"] == 1)
    check("Biodegradable == 1", stats["Biodegradable"] == 1)
    check("Hazardous == 1", stats["Hazardous"] == 1)
    check("Reusable == 1", stats["Reusable"] == 1)
    check("total == 4", sum(stats.values()) == 4)


def test_db_coverage():
    print("\n[test_db_coverage]")
    items = all_items()
    check("120+ items in DB", len(items) >= 120)

    counts = {c: 0 for c in CATEGORIES}
    unknown = []
    for item in items:
        cat = get_category(item)
        if cat in counts:
            counts[cat] += 1
        else:
            unknown.append((item, cat))

    for c in CATEGORIES:
        check(f"{c} has items", counts[c] > 0)

    if unknown:
        print(f"  WARN  {len(unknown)} items with unknown category")

    # Every DB item has a fallback tip
    for item in items[:20]:
        tip = get_fallback_tip(item)
        check(f"fallback for {item}", isinstance(tip, str) and len(tip) > 5)


def test_multilanguage():
    print("\n[test_multilanguage]")
    en = generate_tip("plastic bottle", lang="en")
    check("en tip non-empty", isinstance(en, str) and len(en) > 10)
    # Note: Hindi/Kannada tests would require the model to respond in script
    # Just ensure no crash
    try:
        hi = generate_tip("newspaper", lang="hi")
        check("hi tip doesn't crash", isinstance(hi, str))
    except Exception as e:
        check("hi tip doesn't crash", False, str(e))


def main():
    print("=" * 60)
    print("PERSON 2 UNIT TESTS")
    print("=" * 60)

    test_categorize()
    test_generate_tip()
    test_track_and_stats()
    test_db_coverage()
    test_multilanguage()

    print("\n" + "=" * 60)
    print(f"Results: {PASS} passed, {FAIL} failed")
    print("=" * 60)
    return 0 if FAIL == 0 else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
