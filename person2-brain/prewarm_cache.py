"""
Pre-warm the tip cache for demo items.
Run this before any pitch/rehearsal — every clicked item will be instant.
"""

import time
from person2_ai import generate_tip


DEMO_ITEMS = [
    "battery",
    "pizza box",
    "banana peel",
    "plastic bottle",
    "aluminum can",
    "old t-shirt",
    "neon sign",
    "shredded paper",
    "paint can",
    "coffee grounds",
    "broken glass",
    "light bulb",
    "motor oil",
    "book",
    "cardboard box",
    "apple core",
    "mason jar",
    "medicine",
    "newspaper",
    "egg shells",
    "aerosol can",
    "propane tank",
    "sharp needle",
    "expired medication",
    "mercury thermometer",
    "e-waste",
    "old phone",
    "wine cork",
    "backpack",
    "coffee cup",
    "yogurt tub",
    "shampoo bottle",
    "glass jar",
    "cardboard tube",
    "paper towel roll",
]


def main():
    print(f"Pre-warming cache for {len(DEMO_ITEMS)} demo items...")
    print("This will take ~2-4 minutes with 7B. Items are cached after.\n")

    t_start = time.time()
    for i, item in enumerate(DEMO_ITEMS, 1):
        t0 = time.time()
        try:
            generate_tip(item)
            dt = time.time() - t0
            status = "cached" if dt < 0.5 else f"{dt:.1f}s"
            print(f"[{i:2d}/{len(DEMO_ITEMS)}] {item:25s} {status}")
        except Exception as e:
            print(f"[{i:2d}/{len(DEMO_ITEMS)}] {item:25s} ERROR: {e}")

    total = time.time() - t_start
    print(f"\nPre-warmed in {total:.1f}s")
    print("Now every demo click will be INSTANT.")


if __name__ == "__main__":
    main()
