"""
Person 1 — Vision Classifier
Takes an image → returns a 2-4 word waste label via qwen3-vl:4b (Ollama).

Handles qwen3's thinking mode:
- num_predict=400 gives enough budget for thinking + answer
- Falls back to reading the 'thinking' field if 'response' is empty
"""

import base64
import io
import re
import requests
from PIL import Image

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3-vl:4b"

CLASSIFY_PROMPT = """You are a waste classification assistant.
Look at the image and identify the MAIN waste item.
Respond with ONLY a 2-4 word label in lowercase. No explanations, no punctuation.

Examples:
- A clear plastic water bottle -> plastic bottle
- A brown paper bag -> paper
- A glass jar -> glass jar
- A soda can -> aluminum can
- A cardboard box -> cardboard box
- A banana peel -> banana peel

Label:"""


def _to_base64(image) -> str:
    if not isinstance(image, Image.Image):
        image = Image.fromarray(image)
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _extract_label(text: str) -> str:
    """Pull a short label out of a possibly-verbose response."""
    if not text:
        return ""
    text = text.strip().lower()
    # Take the last line (usually the actual answer)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return ""
    last = lines[-1]
    # Strip quotes / punctuation
    last = last.strip('"').strip("'").strip(".").strip()
    # If it's a sentence, take the last few words
    if len(last.split()) > 5:
        last = " ".join(last.split()[-4:])
    # Remove common lead-ins
    last = re.sub(r"^(the |a |an )", "", last)
    return last


def classify_frame(image) -> str:
    try:
        img_b64 = _to_base64(image)
        payload = {
            "model": MODEL,
            "prompt": CLASSIFY_PROMPT,
            "images": [img_b64],
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 400},
        }
        r = requests.post(OLLAMA_URL, json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()

        # Try response field first
        raw = (data.get("response") or "").strip()
        # Fall back to thinking field if response is empty
        if not raw and data.get("thinking"):
            raw = data["thinking"].strip()

        label = _extract_label(raw)
        return label or "unknown"
    except Exception as e:
        return f"error: {e}"


def classify_path(path: str) -> str:
    return classify_frame(Image.open(path))


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        print(classify_path(sys.argv[1]))
    else:
        print("Usage: python3 person1_vision.py <image_path>")
