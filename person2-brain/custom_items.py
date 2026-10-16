"""
Runtime-added waste items.
Persists to custom_items.json so new items survive restarts.
"""

import json
from pathlib import Path

CUSTOM_FILE = Path("custom_items.json")


def load_custom() -> dict:
    """Load user-added items."""
    if not CUSTOM_FILE.exists():
        return {}
    try:
        return json.loads(CUSTOM_FILE.read_text())
    except Exception:
        return {}


def save_custom(items: dict):
    """Persist user-added items to disk."""
    CUSTOM_FILE.write_text(json.dumps(items, indent=2, ensure_ascii=False))


def add_item(label: str, category: str, tip: str = None) -> dict:
    """
    Add a new item to the custom DB.
    Returns the added item's data.
    """
    label = (label or "").strip().lower()
    if not label:
        raise ValueError("label required")

    valid = {"Recyclable", "Biodegradable", "Hazardous", "Reusable"}
    if category not in valid:
        raise ValueError(f"category must be one of: {sorted(valid)}")

    # Auto-generate tip if not provided
    if not tip:
        try:
            from person2_ai import generate_tip
            tip = generate_tip(label)
        except Exception:
            tip = f"Dispose of '{label}' according to local guidelines."

    items = load_custom()
    items[label] = {"category": category, "tip": tip}
    save_custom(items)

    # Also inject into the in-memory DB so it's usable immediately
    try:
        from waste_items import WASTE_DB
        WASTE_DB[label] = (category, tip)
    except Exception:
        pass

    return {"label": label, "category": category, "tip": tip}


def load_into_db():
    """Load custom items into the main DB at startup."""
    try:
        from waste_items import WASTE_DB
        for label, data in load_custom().items():
            if label not in WASTE_DB:
                WASTE_DB[label] = (data["category"], data["tip"])
    except Exception:
        pass


def count() -> int:
    return len(load_custom())


if __name__ == "__main__":
    print(f"Custom items loaded: {count()}")
    print(f"File: {CUSTOM_FILE}")
