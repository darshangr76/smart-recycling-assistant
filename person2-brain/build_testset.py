"""
Build a balanced 60-image test set from TrashNet.
10 images per class across 6 classes.
"""

import json
import random
import shutil
from pathlib import Path

random.seed(42)

TRASHNET = Path("benchmark_data/dataset-resized")
OUT_IMAGES = Path("benchmark_data/images")
LABELS_FILE = Path("benchmark_data/labels.json")

CLASS_MAP = {
    "plastic":   ("plastic bottle",  "Recyclable"),
    "glass":     ("glass jar",       "Recyclable"),
    "metal":     ("aluminum can",    "Recyclable"),
    "paper":     ("paper",           "Recyclable"),
    "cardboard": ("cardboard box",   "Recyclable"),
    "trash":     ("mixed trash",     "Hazardous"),
}

PER_CLASS = 10


def main():
    OUT_IMAGES.mkdir(parents=True, exist_ok=True)
    labels = {}

    for cls, (raw_label, category) in CLASS_MAP.items():
        src_dir = TRASHNET / cls
        if not src_dir.exists():
            print(f"SKIP {cls} - not found")
            continue

        imgs = sorted(src_dir.glob("*.jpg")) + sorted(src_dir.glob("*.png"))
        chosen = random.sample(imgs, min(PER_CLASS, len(imgs)))

        for i, src in enumerate(chosen):
            dst_name = f"{cls}_{i:03d}{src.suffix}"
            dst = OUT_IMAGES / dst_name
            shutil.copy(src, dst)
            labels[dst_name] = {
                "trashnet_class": cls,
                "expected_label": raw_label,
                "expected_category": category,
            }

        print(f"OK {cls}: copied {len(chosen)} images")

    LABELS_FILE.write_text(json.dumps(labels, indent=2))
    print(f"\nTotal: {len(labels)} images")
    print(f"Labels: {LABELS_FILE}")


if __name__ == "__main__":
    main()
