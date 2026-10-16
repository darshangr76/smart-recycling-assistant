"""
Person 2 - The AI Brain
Generates disposal tips, tracks items for the Digital Twin, returns stats.

Public API:
    generate_tip(label, lang="en")   -> 2-sentence disposal tip
    track_item(label)                -> append to material_flow.json
    get_stats()                      -> {category: count}

Environment:
    PERSON2_MODEL   Override default LLM (e.g. "qwen3:4b" or "qwen2.5-coder:14b")
    PERSON2_DEBUG   Set to "1" for verbose logging
"""

import json
import os
import time
from datetime import datetime
from functools import lru_cache
from pathlib import Path

import requests

from waste_items import get_category, get_fallback_tip, CATEGORIES

try:
    from rag_engine import retrieve as rag_retrieve, format_context as rag_format
    RAG_AVAILABLE = True
except Exception:
    RAG_AVAILABLE = False
    rag_retrieve = lambda q, top_k=3: []
    rag_format = lambda chunks: ""


# ─── Config ────────────────────────────────────────────────────────────
OLLAMA_URL = "http://localhost:11434/api/generate"
PRIMARY_MODEL = os.environ.get("PERSON2_MODEL", "qwen2.5:7b")
FALLBACK_MODEL = "qwen2.5-coder:3b"
DEBUG = os.environ.get("PERSON2_DEBUG") == "1"

TIP_CACHE_FILE = Path("tip_cache.json")
FLOW_FILE = Path("material_flow.json")

LANG_INSTRUCTIONS = {
    "en": "Respond in English.",
    "hi": "Respond in Hindi (Devanagari script).",
    "kn": "Respond in Kannada script.",
}

# ─── Disk cache ────────────────────────────────────────────────────────
def _load_cache() -> dict:
    if TIP_CACHE_FILE.exists():
        try:
            return json.loads(TIP_CACHE_FILE.read_text())
        except Exception:
            return {}
    return {}


def _save_cache(cache: dict):
    TIP_CACHE_FILE.write_text(json.dumps(cache, indent=2, ensure_ascii=False))


# ─── LLM call ──────────────────────────────────────────────────────────
def _call_ollama(model: str, prompt: str, timeout: int = 60) -> str:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 200},
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
    r.raise_for_status()
    data = r.json()
    text = (data.get("response") or "").strip()
    if not text and data.get("thinking"):
        # Model burned budget on thinking - use last sentence
        text = data["thinking"].strip().split(".")[-1].strip()
    return text


# ─── Public API ────────────────────────────────────────────────────────
@lru_cache(maxsize=256)
def generate_tip(label: str, lang: str = "en") -> str:
    """Return a 2-sentence disposal tip. Falls back gracefully."""
    label = (label or "").strip().lower()
    if not label:
        return "Please provide a waste item to get disposal guidance."

    cache_key = f"{lang}::{label}"
    cache = _load_cache()
    if cache_key in cache:
        if DEBUG:
            print(f"[cache hit] {cache_key}")
        return cache[cache_key]

    # If item is in our curated DB, anchor the LLM to the correct fact
    reference = get_fallback_tip(label)
    category = get_category(label)

    # RAG: retrieve relevant guideline chunks
    rag_context = ""
    if RAG_AVAILABLE:
        try:
            chunks = rag_retrieve(label, top_k=2)
            rag_context = rag_format(chunks)
        except Exception:
            rag_context = ""

    # Extra rules for tricky categories
    extra_rules = ""
    if category == "Reusable":
        extra_rules = "IMPORTANT: This item should NOT go in a recycling bin or trash. Focus on donate, reuse, or repurpose."
    elif category == "Hazardous":
        extra_rules = "IMPORTANT: This item needs special drop-off (HHW facility, take-back program, or e-waste center). Never say 'recycling bin' or 'regular trash' unless specifically correct."

    prompt = f"""You are a waste disposal expert. The item is: {label}
Category: {category}

REFERENCE FACT (authoritative, do not contradict):
{reference}

{rag_context}

Rewrite the reference as a clear 2-sentence tip. Cover: (1) where it goes, (2) one specific action.
Use the guidelines above for specificity if helpful, but never contradict the reference fact.
{extra_rules}
{ LANG_INSTRUCTIONS.get(lang, LANG_INSTRUCTIONS['en']) }
Be concise. Do not use bullet points."""

    # Try primary model, then fallback, then DB
    tip = None
    for model in (PRIMARY_MODEL, FALLBACK_MODEL):
        try:
            t0 = time.time()
            tip = _call_ollama(model, prompt)
            if tip:
                if DEBUG:
                    print(f"[{model}] {time.time()-t0:.1f}s -> {tip[:60]}...")
                break
        except Exception as e:
            if DEBUG:
                print(f"[{model} failed] {e}")
            continue

    if not tip:
        tip = get_fallback_tip(label)
        if DEBUG:
            print(f"[fallback DB tip] {tip[:60]}...")

    cache[cache_key] = tip
    _save_cache(cache)
    return tip


def track_item(label: str):
    """Append an item to the Digital Twin log."""
    label = (label or "").strip().lower()
    if not label:
        return

    entries = []
    if FLOW_FILE.exists():
        try:
            entries = json.loads(FLOW_FILE.read_text())
        except Exception:
            entries = []

    entries.append({
        "timestamp": datetime.now().isoformat(),
        "label": label,
        "category": get_category(label),
    })

    FLOW_FILE.write_text(json.dumps(entries, indent=2))


def get_stats() -> dict:
    """Return counts per category."""
    stats = {c: 0 for c in CATEGORIES}
    if not FLOW_FILE.exists():
        return stats

    try:
        log = json.loads(FLOW_FILE.read_text())
    except Exception:
        return stats

    for entry in log:
        cat = entry.get("category") or get_category(entry.get("label", ""))
        if cat in stats:
            stats[cat] += 1
    return stats


# ─── Backwards compat ──────────────────────────────────────────────────
def _categorize(label: str) -> str:
    """Legacy name kept so existing imports don't break."""
    return get_category(label)


if __name__ == "__main__":
    print("Testing Person 2 module...\n")

    for lbl in ["plastic bottle", "banana peel", "battery", "t-shirt"]:
        tip = generate_tip(lbl)
        track_item(lbl)
        print(f"{lbl:20s} -> {tip[:70]}...")

    print(f"\nStats: {get_stats()}")
