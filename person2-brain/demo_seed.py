"""Seed material_flow.json with 30 days of realistic demo data."""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

random.seed(42)

ITEMS = [
    ("plastic bottle", "Recyclable"), ("aluminum can", "Recyclable"),
    ("cardboard box", "Recyclable"), ("newspaper", "Recyclable"),
    ("glass jar", "Recyclable"), ("milk jug", "Recyclable"),
    ("soda can", "Recyclable"), ("cereal box", "Recyclable"),
    ("shampoo bottle", "Recyclable"), ("yogurt tub large", "Recyclable"),
    ("banana peel", "Biodegradable"), ("coffee grounds", "Biodegradable"),
    ("apple core", "Biodegradable"), ("egg shells", "Biodegradable"),
    ("vegetable scraps", "Biodegradable"), ("tea bags", "Biodegradable"),
    ("orange peel", "Biodegradable"), ("bread", "Biodegradable"),
    ("battery", "Hazardous"), ("light bulb", "Hazardous"),
    ("paint can", "Hazardous"), ("old phone", "Hazardous"),
    ("t-shirt", "Reusable"), ("mason jar", "Reusable"),
    ("book", "Reusable"), ("towel", "Reusable"),
    ("backpack", "Reusable"), ("wine cork", "Reusable"),
]

WEIGHTS = {"Recyclable": 5, "Biodegradable": 4, "Hazardous": 1, "Reusable": 2}
DAYS = 30


def main():
    log = []
    now = datetime.now()

    for day in range(DAYS):
        # Force today (day=DAYS-1) to have entries
        n_items = random.randint(3, 6) if day < DAYS - 1 else random.randint(4, 7)
        for _ in range(n_items):
            cats = [c for c, w in WEIGHTS.items() for _ in range(w)]
            cat = random.choice(cats)
            candidates = [i for i in ITEMS if i[1] == cat]
            if not candidates:
                continue
            label, _ = random.choice(candidates)
            if day == DAYS - 1:
                # Today: only hours before now
                max_h = max(1, now.hour)
                ts = (now - timedelta(hours=random.randint(1, max_h),
                                      minutes=random.randint(0, 59))).isoformat()
            else:
                ts = (now - timedelta(days=DAYS - day,
                                      hours=random.randint(0, 23),
                                      minutes=random.randint(0, 59))).isoformat()
            log.append({"timestamp": ts, "label": label, "category": cat})

    Path("material_flow.json").write_text(json.dumps(log, indent=2))

    from collections import Counter
    c = Counter(e["category"] for e in log)
    print(f"Seeded {len(log)} items over {DAYS} days:")
    for cat in ["Recyclable", "Biodegradable", "Hazardous", "Reusable"]:
        print(f"  {cat}: {c[cat]}")


if __name__ == "__main__":
    main()
