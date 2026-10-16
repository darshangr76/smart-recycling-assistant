"""
main.py
-------
Smart Recycling - Vision Module entry point.

Usage:
    python main.py                -> live webcam scanner
    python main.py <image>        -> classify a single image
"""

import sys
from pathlib import Path


BANNER = """
============================================================
   SMART RECYCLING ASSISTANT - Vision Module
   Powered by Gemini Vision AI
============================================================
"""


def main():
    print(BANNER)

    if len(sys.argv) >= 2:
        image_path = sys.argv[1]
        if not Path(image_path).exists():
            print(f"File not found: {image_path}")
            sys.exit(1)

        from vision_engineer import classify_waste_full
        print(f"Classifying: {image_path}\n")
        result = classify_waste_full(image_path)
        print(f"\n  Label      : {result['label']}")
        print(f"  Confidence : {result['confidence']}%")
        print(f"  Reason     : {result['reason']}\n")
        return

    print("Launching live webcam scanner...\n")
    from webcam_scanner import run_scanner
    run_scanner()


if __name__ == "__main__":
    main()
