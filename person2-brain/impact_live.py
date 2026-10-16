"""
Live impact tracking.
Returns real-time CO2 + equivalences for the frontend to display.
"""

from datetime import datetime
from pathlib import Path

from impact import compute as compute_impact


def live_impact() -> dict:
    """
    Return live impact metrics for the frontend.
    Called on every scan / updated by polling.
    """
    imp = compute_impact()
    return {
        "timestamp": datetime.now().isoformat(),
        "total_items": imp["total_items"],
        "co2_avoided_kg": imp["co2_avoided_kg"],
        "co2_avoided_g": imp["co2_avoided_g"],
        "by_category": imp["by_category"],
        "equivalences": imp["equivalences"],
        "message": _format_message(imp),
    }


def _format_message(imp: dict) -> str:
    """Human-readable impact message for the UI."""
    kg = imp["co2_avoided_kg"]
    km = imp["equivalences"]["km_driven"]
    if kg < 0.1:
        return "Start scanning to see your impact!"
    return f"Your household has avoided {kg} kg CO₂ — equivalent to driving {km} km less."


if __name__ == "__main__":
    import json
    print(json.dumps(live_impact(), indent=2))
