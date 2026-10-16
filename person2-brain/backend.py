"""
Backend pipeline for the Smart Recycling Assistant.
Unified: image -> label -> category -> tip -> Digital Twin -> stats.

Enhancements:
- Image classification returns confidence + RAG sources + timing
- Graceful fallbacks if vision or LLM fails
- Safety analysis hook
"""

import time

from person2_ai import generate_tip, track_item, get_stats
from waste_items import get_category
from impact import compute as compute_impact


def _mock_classify(image):
    return "unknown"


def _classify(image):
    """
    Try Person 1's vision classifier.
    Returns (label, confidence, source, elapsed_ms).
    """
    t0 = time.time()
    try:
        from person1_vision import classify_frame
        label = classify_frame(image)
        elapsed = (time.time() - t0) * 1000

        if label and not label.startswith("error"):
            # Confidence heuristic: length + cleanliness
            conf = 0.85 if len(label.split()) <= 4 and label.isascii() else 0.55
            return label, round(conf, 2), "vision", round(elapsed, 1)

        return label or "unknown", 0.3, "vision_error", round(elapsed, 1)

    except ImportError:
        elapsed = (time.time() - t0) * 1000
        return _mock_classify(image), 0.0, "mock_no_vision_module", round(elapsed, 1)

    except Exception as e:
        elapsed = (time.time() - t0) * 1000
        return _mock_classify(image), 0.0, f"mock_error:{e}", round(elapsed, 1)


def _get_rag_sources(label: str, top_k: int = 2, min_score: float = 0.55) -> list:
    """Retrieve RAG chunks used to ground the tip. Filters weak matches."""
    try:
        from rag_engine import retrieve
        chunks = retrieve(label, top_k=top_k)
        return [c for c in chunks if c.get("score", 0) >= min_score]
    except Exception:
        return []


def _get_safety_warnings(label: str, category: str) -> dict:
    """
    Full safety + contamination analysis.
    Returns {warnings: [...], safety_level: str, contamination_risk: str}.
    """
    try:
        from safety import analyze
        result = analyze(label, category)
        return {
            "warnings": result["warnings"],
            "safety_level": result["safety_level"],
            "contamination_risk": result["contamination_risk"],
        }
    except Exception as e:
        return {
            "warnings": [f"Safety check unavailable: {e}"],
            "safety_level": "unknown",
            "contamination_risk": "unknown",
        }


def classify_and_tip(image) -> dict:
    """
    End-to-end image pipeline with rich metadata.
    """
    result = {
        "success": False,
        "label": None,
        "confidence": None,
        "category": None,
        "tip": None,
        "source": None,
        "elapsed_ms": None,
        "rag_sources": [],
        "safety_warnings": [],
        "safety_level": None,
        "contamination_risk": None,
        "stats": {},
        "impact": {},
        "error": None,
    }

    # [1] Classify
    try:
        label, conf, source, elapsed = _classify(image)
        result["label"] = label
        result["confidence"] = conf
        result["source"] = source
        result["elapsed_ms"] = elapsed
    except Exception as e:
        result["error"] = f"classify failed: {e}"
        return result

    # [2] Category
    try:
        result["category"] = get_category(result["label"])
    except Exception as e:
        result["category"] = "Unknown"
        result["error"] = f"category failed: {e}"

    # [3] RAG sources
    result["rag_sources"] = _get_rag_sources(result["label"], top_k=2)

    # [4] Safety warnings
    _safety = _get_safety_warnings(result["label"], result["category"])
    result["safety_warnings"] = _safety["warnings"]
    result["safety_level"] = _safety["safety_level"]
    result["contamination_risk"] = _safety["contamination_risk"]

    # [5] Tip
    try:
        result["tip"] = generate_tip(result["label"])
    except Exception as e:
        result["tip"] = "Check local waste guidelines for disposal."
        result["error"] = f"tip failed: {e}"

    # [6] Track
    try:
        track_item(result["label"])
    except Exception as e:
        result["error"] = f"track failed: {e}"

    # [7] Stats + impact
    try:
        result["stats"] = get_stats()
        result["impact"] = compute_impact()
    except Exception as e:
        result["error"] = f"stats failed: {e}"

    result["success"] = True
    return result


def classify_label_only(label: str) -> dict:
    """Take a label directly (skip vision) with same rich metadata."""
    result = {
        "success": False,
        "label": label,
        "confidence": 1.0,  # label-based, so 100% confidence
        "category": None,
        "tip": None,
        "source": "label_input",
        "elapsed_ms": 0.0,
        "rag_sources": [],
        "safety_warnings": [],
        "safety_level": None,
        "contamination_risk": None,
        "stats": {},
        "impact": {},
        "error": None,
    }
    try:
        result["category"] = get_category(label)
        result["rag_sources"] = _get_rag_sources(label, top_k=2)
        _safety = _get_safety_warnings(label, result["category"])
        result["safety_warnings"] = _safety["warnings"]
        result["safety_level"] = _safety["safety_level"]
        result["contamination_risk"] = _safety["contamination_risk"]
        result["tip"] = generate_tip(label)
        track_item(label)
        result["stats"] = get_stats()
        result["impact"] = compute_impact()
        result["success"] = True
    except Exception as e:
        result["error"] = str(e)
    return result


def health() -> dict:
    """Diagnostic info for judges and monitoring."""
    out = {
        "vision_available": False,
        "person2_available": False,
        "ollama_reachable": False,
        "items_in_db": 0,
        "rag_chunks": 0,
    }
    try:
        from waste_items import WASTE_DB
        out["items_in_db"] = len(WASTE_DB)
        out["person2_available"] = True
    except Exception:
        pass

    try:
        from rag_docs import GUIDELINES
        out["rag_chunks"] = len(GUIDELINES)
    except Exception:
        pass

    try:
        from person1_vision import classify_frame  # noqa
        out["vision_available"] = True
    except Exception:
        pass

    try:
        import requests
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        out["ollama_reachable"] = r.status_code == 200
    except Exception:
        pass

    return out


if __name__ == "__main__":
    import json
    print("=== backend.py self-test ===")

    print("\n[health]")
    print(json.dumps(health(), indent=2))

    print("\n[classify_label_only('battery')]")
    out = classify_label_only("battery")
    print(json.dumps({
        k: v for k, v in out.items()
        if k not in ("stats", "impact")
    }, indent=2))

    print("\n✅ backend.py works")
