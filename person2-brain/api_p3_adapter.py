"""
Adapter layer for Person 3's frontend.
Maps Person 2's rich pipeline to their expected schema.
"""

from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image

from backend import classify_and_tip, classify_label_only


router = APIRouter()


CATEGORY_MAP = {
    "Recyclable": "Plastic",
    "Biodegradable": "Organic / compostable",
    "Hazardous": "Potentially hazardous waste",
    "Reusable": "General or non-recyclable waste",
}


def _refine_category(label: str, our_category: str) -> str:
    """Refine our 4-way category into their 9-way category."""
    label_lower = (label or "").lower()

    if any(k in label_lower for k in ["battery", "batteries"]):
        return "Batteries"
    e_waste_keywords = [
        "e-waste", "electronics", "phone", "laptop", "cable", "charger",
        "microwave", "toaster", "toaster oven", "kettle", "blender", "vacuum",
        "fan", "heater", "speaker", "headphone", "earbud", "airpods",
        "camera", "monitor", "tv", "television", "printer", "router", "modem",
        "console", "playstation", "xbox", "nintendo", "game boy", "gameboy",
        "power bank", "powerbank", "battery", "smartwatch", "tablet",
        "ipad", "ipod", "mp3", "kindle", "e-reader", "ereader",
        "dvd player", "bluray", "vcr", "stereo", "receiver", "radio",
        "projector", "drone", "webcam", "keyboard", "mouse", "usb",
        "sd card", "memory card", "flash drive", "hard drive", "ssd",
        "appliance", "electronics device", "electric razor", "hair dryer",
        "electric toothbrush", "massage gun", "sewing machine", "iron",
    ]
    if any(k in label_lower for k in e_waste_keywords):
        return "Electronic waste"
    if any(k in label_lower for k in ["glass", "jar"]):
        return "Glass"
    if any(k in label_lower for k in ["aluminum", "can", "tin", "metal", "foil", "steel"]):
        return "Metal"
    if any(k in label_lower for k in ["paper", "cardboard", "newspaper", "magazine", "carton", "tetra"]):
        return "Paper and cardboard"
    if any(k in label_lower for k in ["plastic", "pet", "hdpe", "ldpe", "pp", "bottle"]):
        return "Plastic"
    if any(k in label_lower for k in ["food", "peel", "organic", "compost", "scrap"]):
        return "Organic / compostable"
    if any(k in label_lower for k in ["cfl", "fluorescent", "paint", "solvent", "chemical", "pesticide"]):
        return "Potentially hazardous waste"

    return CATEGORY_MAP.get(our_category, "General or non-recyclable waste")


def _map_to_p3_schema(result: dict) -> dict:
    """Map Person 2's response to Person 3's expected schema."""
    label = result.get("label") or "unknown item"
    our_category = result.get("category") or "Unknown"
    p3_category = _refine_category(label, our_category)

    rag_sources = result.get("rag_sources") or []
    instructions = [s.get("topic", "") for s in rag_sources if s.get("topic")]
    if not instructions:
        instructions = [
            "Empty and rinse if needed",
            "Check local municipality guidelines",
            "Place in appropriate collection stream",
        ]

    safety_level = result.get("safety_level") or "safe"
    contamination_risk = result.get("contamination_risk") or "medium"
    hazard_map = {"safe": "none", "caution": "low", "dangerous": "high"}
    hazard_level = hazard_map.get(safety_level, "none")

    impact = result.get("impact") or {}
    co2 = impact.get("co2_avoided_kg", 0.05)
    if not isinstance(co2, (int, float)):
        co2 = 0.05

    return {
        "itemName": label.title(),
        "category": p3_category,
        "confidence": result.get("confidence") or 0.85,
        "recyclable": our_category in ("Recyclable", "Biodegradable"),
        "instructions": instructions,
        "disposalMethod": result.get("tip") or "Check local guidelines.",
        "specialHandling": hazard_level in ("medium", "high"),
        "hazardLevel": hazard_level,
        "preparationSteps": instructions[:3],
        "commonMistakes": (
            ["Do not bag recyclables in plastic film."]
            if contamination_risk == "high"
            else ["Rinse before recycling."]
        ),
        "environmentalTip": f"Estimated CO2 avoided: {co2} kg based on our impact model.",
        "estimatedWeightKg": 0.05,
        "carbonAvoidedKg": round(co2, 4),
        "rag_sources": rag_sources,
        "safety_warnings": result.get("safety_warnings") or [],
        "contamination_risk": contamination_risk,
        "elapsed_ms": result.get("elapsed_ms"),
    }


@router.get("/api/health")
async def health_p3():
    """Health check matching Person 3's contract."""
    from backend import health
    h = health()
    return {
        "status": "online",
        "service": "Person 2 AI Backend (Smart Recycle)",
        "version": "1.0.0",
        "itemsInDB": h.get("items_in_db"),
        "ragChunks": h.get("rag_chunks"),
        "visionAvailable": h.get("vision_available"),
        "ollamaReachable": h.get("ollama_reachable"),
    }


@router.post("/api/classify-waste")
async def classify_waste(image: UploadFile = File(...)):
    """Multipart image upload endpoint matching Person 3's frontend contract."""
    try:
        contents = await image.read()
        if not contents:
            raise HTTPException(400, "Empty image")
        try:
            img = Image.open(BytesIO(contents)).convert("RGB")
        except Exception as e:
            raise HTTPException(400, f"Invalid image: {e}")

        result = classify_and_tip(img)
        return _map_to_p3_schema(result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Pipeline error: {e}")


@router.post("/api/classify-text")
async def classify_text(label: str):
    """Text label input for frontend's manual override."""
    try:
        result = classify_label_only(label)
        return _map_to_p3_schema(result)
    except Exception as e:
        raise HTTPException(500, f"Pipeline error: {e}")


if __name__ == "__main__":
    from backend import classify_label_only
    import json
    r = classify_label_only("battery")
    print(json.dumps(_map_to_p3_schema(r), indent=2))
