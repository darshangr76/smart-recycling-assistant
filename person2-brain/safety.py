"""
Safety & contamination detection for waste items.
Returns warnings, safety level, and contamination risk.
"""

# Category-level safety
CATEGORY_SAFETY = {
    "Recyclable": "safe",
    "Biodegradable": "safe",
    "Hazardous": "dangerous",
    "Reusable": "safe",
}

# Category-level contamination risk
CATEGORY_CONTAMINATION = {
    "Recyclable": "medium",     # rinse required
    "Biodegradable": "low",     # mostly OK
    "Hazardous": "high",        # never mix
    "Reusable": "low",          # clean before donate
}

# Keyword-based rules
CONTAMINATION_RULES = [
    (["pizza box", "greasy"], "Greasy items contaminate paper recycling — compost or trash instead."),
    (["wet cardboard", "wet paper"], "Wet paper cannot be recycled — dry first or compost."),
    (["mixed material", "multi-layer", "chip bag"], "Multi-layer packaging is rarely recyclable."),
    (["food residue", "dirty", "unrinsed"], "Food residue contaminates recycling — rinse first."),
    (["bagged", "in bag"], "Never bag recyclables in plastic film."),
    (["black plastic"], "Black plastic is not sortable by optical scanners."),
    (["plastic bag", "plastic film"], "Plastic film tangles sorting equipment — use store drop-off."),
    (["styrofoam", "polystyrene", "foam"], "Foam is rarely recyclable — check local program."),
]

SAFETY_RULES = [
    (["battery", "lithium", "li-ion"], "Fire risk: tape terminals before transport."),
    (["sharps", "needle", "syringe", "lancet"], "Use puncture-resistant sharps container."),
    (["broken glass", "shards"], "Wrap in newspaper or cardboard before disposal."),
    (["aerosol", "spray can", "propane", "butane"], "Pressurized — do not puncture or crush."),
    (["asbestos"], "Carcinogenic — special handling required. Hire licensed pro."),
    (["lead", "mercury", "cadmium"], "Toxic heavy metal — HHW only, never trash."),
    (["medical", "infectious", "blood"], "Medical waste handler required."),
    (["ammunition", "gunpowder", "firework", "flare"], "Explosive hazard — police or fire station."),
    (["paint", "solvent", "thinner", "turpentine"], "HHW. Flammable and toxic."),
    (["pesticide", "herbicide", "insecticide", "rodenticide"], "HHW. Toxic to wildlife."),
    (["motor oil", "antifreeze", "brake fluid"], "HHW. Toxic to waterways."),
    (["medicine", "pharmaceutical", "expired meds"], "Pharmacy take-back. Don't flush."),
    (["cfl", "fluorescent"], "Mercury hazard — hardware store or HHW."),
    (["e-waste", "electronic", "circuit"], "E-waste. Wipe data first."),
]


def analyze(label: str, category: str = None) -> dict:
    """
    Analyze a waste item for safety + contamination.
    Returns dict with warnings, safety_level, contamination_risk.
    """
    label_lower = (label or "").lower().strip()

    if not category:
        try:
            from waste_items import get_category
            category = get_category(label)
        except Exception:
            category = "Unknown"

    # Base levels from category
    safety_level = CATEGORY_SAFETY.get(category, "caution")
    contamination_risk = CATEGORY_CONTAMINATION.get(category, "medium")

    warnings = []

    # Apply rules
    for keywords, message in CONTAMINATION_RULES:
        if any(k in label_lower for k in keywords):
            warnings.append(f"Contamination: {message}")
            contamination_risk = "high"

    for keywords, message in SAFETY_RULES:
        if any(k in label_lower for k in keywords):
            warnings.append(f"Safety: {message}")
            if safety_level != "dangerous":
                safety_level = "caution"

    # Category-level warnings
    if category == "Hazardous" and not warnings:
        warnings.append("Hazardous — take to HHW facility. Never trash.")
        safety_level = "dangerous"
    if category == "Recyclable" and not warnings:
        warnings.append("Rinse before recycling to avoid contamination.")

    return {
        "label": label,
        "category": category,
        "safety_level": safety_level,
        "contamination_risk": contamination_risk,
        "warnings": warnings,
    }


def format_banner(result: dict) -> str:
    """Human-readable banner for UI."""
    safety = result["safety_level"]
    icon = {"safe": "✅", "caution": "⚠️", "dangerous": "🚨"}.get(safety, "ℹ️")
    lines = [f"{icon} Safety: {safety.upper()}"]
    for w in result["warnings"]:
        lines.append(f"  • {w}")
    return "\n".join(lines)


if __name__ == "__main__":
    import json
    test_items = [
        ("battery", "Hazardous"),
        ("plastic bottle", "Recyclable"),
        ("pizza box", "Recyclable"),
        ("broken glass", "Recyclable"),
        ("banana peel", "Biodegradable"),
    ]
    for label, cat in test_items:
        result = analyze(label, cat)
        print(f"\n=== {label} ===")
        print(json.dumps(result, indent=2))
