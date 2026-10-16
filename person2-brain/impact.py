"""
Impact calculator for Person 2.
Turns the Digital Twin log into human-friendly environmental metrics.
"""

import json
from pathlib import Path

FLOW_FILE = Path("material_flow.json")

# CO2 savings estimates per item (grams of CO2e avoided vs. landfill)
# Sources: EPA WARM model (approximated for pitch purposes)
CO2_PER_ITEM = {
    "Recyclable":    180,   # avg across plastic/glass/metal/paper
    "Biodegradable": 25,    # composting avoids methane from landfill
    "Hazardous":     350,   # diverting from landfill avoids long-term damage
    "Reusable":      900,   # reuse substitutes new product manufacture
}

# Fun equivalences for the pitch
def equivalences(co2_grams: float) -> dict:
    return {
        "km_driven": round(co2_grams / 250, 1),        # 250 g CO2e / km avg car
        "trees_yearly": round(co2_grams / 21000, 2),   # 21 kg / tree / year
        "phone_charges": round(co2_grams / 8.2, 0),    # 8.2 g per phone charge
        "hours_led": round(co2_grams / 5.0, 0),        # 5 g / hour for 10W LED
    }


def load_log() -> list:
    if not FLOW_FILE.exists():
        return []
    try:
        return json.loads(FLOW_FILE.read_text())
    except Exception:
        return []


def compute(since: str = None) -> dict:
    """Compute impact. If since is given (ISO timestamp), filter to entries after."""
    log = load_log()
    if since:
        log = [e for e in log if e.get("timestamp", "") >= since]

    counts = {"Recyclable": 0, "Biodegradable": 0, "Hazardous": 0, "Reusable": 0}
    for e in log:
        cat = e.get("category")
        if cat in counts:
            counts[cat] += 1

    total_co2 = sum(counts[c] * CO2_PER_ITEM[c] for c in counts)

    return {
        "total_items": sum(counts.values()),
        "by_category": counts,
        "co2_avoided_g": total_co2,
        "co2_avoided_kg": round(total_co2 / 1000, 2),
        "equivalences": equivalences(total_co2),
    }


def format_report(impact: dict = None) -> str:
    """Human-readable report for pitch and UI."""
    imp = impact or compute()
    lines = [
        "🌍 YOUR HOUSEHOLD IMPACT",
        "─" * 30,
        f"Items processed:       {imp['total_items']}",
        "",
        "By category:",
        f"  ♻️  Recyclable:        {imp['by_category']['Recyclable']}",
        f"  🌱  Biodegradable:    {imp['by_category']['Biodegradable']}",
        f"  ⚠️   Hazardous diverted: {imp['by_category']['Hazardous']}",
        f"  🔄  Reusable:          {imp['by_category']['Reusable']}",
        "",
        f"💨  Estimated CO₂ avoided: {imp['co2_avoided_kg']} kg",
        "",
        "Equivalent to:",
        f"  🚗  Driving {imp['equivalences']['km_driven']} km less",
        f"  🌳  Planting {imp['equivalences']['trees_yearly']} trees for a year",
        f"  📱  Charging {imp['equivalences']['phone_charges']} phones",
        f"  💡  Running an LED bulb for {imp['equivalences']['hours_led']} hours",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    print(format_report())
