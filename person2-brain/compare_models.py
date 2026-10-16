"""Compare tip quality between models. Run after pulling 7B."""
import os
import subprocess
import sys
from pathlib import Path

ITEMS = ["battery", "banana peel", "t-shirt", "paint can", "neon sign"]


def test_model(model):
    print(f"\n{'=' * 60}")
    print(f"MODEL: {model}")
    print("=" * 60)
    os.environ["PERSON2_MODEL"] = model

    if Path("tip_cache.json").exists():
        Path("tip_cache.json").unlink()

    for item in ITEMS:
        result = subprocess.run(
            [sys.executable, "-c",
             f"from person2_ai import generate_tip; print(generate_tip('{item}'))"],
            capture_output=True, text=True, env=os.environ.copy()
        )
        tip = result.stdout.strip()
        print(f"  {item:15s}: {tip[:80]}...")


if __name__ == "__main__":
    models = sys.argv[1:] or ["qwen2.5-coder:3b"]
    for m in models:
        test_model(m)
