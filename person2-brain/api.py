"""
FastAPI backend for the Smart Recycling Assistant.
Person 2's disposal brain, exposed over HTTP.

Run: python3 api.py
Docs: http://localhost:8000/docs
"""

import base64
import io
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from backend import classify_and_tip, classify_label_only, health
from person2_ai import generate_tip, track_item, get_stats
from waste_items import all_items, get_category
from impact import compute as compute_impact
from analytics import summary_json as analytics_summary
from api_p3_adapter import router as p3_router
from custom_items import add_item as add_custom_item, count as custom_count, load_into_db
from locations import get_locations, get_cities

# Load any previously-added custom items at startup
try:
    load_into_db()
except Exception:
    pass

app = FastAPI(
    title="Smart Recycling Assistant API",
    description="Vision + RAG-grounded disposal tips + Digital Twin tracking",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Person 3's frontend adapter
app.include_router(p3_router)


# ─── Request models ─────────────────────────────────────────
class LabelRequest(BaseModel):
    label: str


class ImageRequest(BaseModel):
    image_b64: str  # base64-encoded PNG/JPG


class TrackRequest(BaseModel):
    label: str


# ─── Endpoints ──────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Smart Recycling Assistant API",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Full diagnostic — vision, brain, ollama, DB."""
    return health()


@app.get("/items")
def list_items():
    items = sorted(all_items())
    return {"count": len(items), "items": items}


@app.post("/classify-label")
def classify_label(req: LabelRequest):
    """Full pipeline from a label (skips vision)."""
    label = (req.label or "").strip()
    if not label:
        raise HTTPException(status_code=400, detail="label required")
    return classify_label_only(label)


@app.post("/classify-image")
def classify_image(req: ImageRequest):
    """Full pipeline from a base64 image."""
    try:
        img_bytes = base64.b64decode(req.image_b64)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid image: {e}")
    return classify_and_tip(image)


@app.post("/tip")
def tip(req: LabelRequest):
    """Just get a tip (no tracking)."""
    label = (req.label or "").strip()
    if not label:
        raise HTTPException(status_code=400, detail="label required")
    return {
        "label": label,
        "category": get_category(label),
        "tip": generate_tip(label),
    }


@app.post("/track")
def track(req: TrackRequest):
    """Manually track an item."""
    label = (req.label or "").strip()
    if not label:
        raise HTTPException(status_code=400, detail="label required")
    track_item(label)
    return {"status": "ok", "label": label, "stats": get_stats()}


@app.get("/stats")
def stats():
    return get_stats()


@app.get("/impact")
def impact():
    return compute_impact()


@app.get("/analytics")
def analytics():
    return analytics_summary()




# ─── Add Item ──────────────────────────────────────────────
class AddItemRequest(BaseModel):
    label: str
    category: str
    tip: Optional[str] = None


@app.post("/add-item")
def add_item(req: AddItemRequest):
    """Add a new waste item to the DB at runtime."""
    try:
        result = add_custom_item(req.label, req.category, req.tip)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "status": "ok",
        "item": result,
        "custom_count": custom_count(),
    }


@app.get("/categories")
def list_categories():
    """Return the 4 valid categories."""
    return {
        "categories": ["Recyclable", "Biodegradable", "Hazardous", "Reusable"]
    }


@app.get("/custom-items")
def list_custom():
    """List all user-added items."""
    from custom_items import load_custom
    return {"count": custom_count(), "items": load_custom()}




# ─── Locations ─────────────────────────────────────────────
@app.get("/locations")
def locations(category: str, city: str = None, limit: int = 3):
    """
    Get nearby drop-off locations.
    Params: category (required), city (optional), limit (default 3).
    """
    result = get_locations(category, city, limit)
    return {
        "category": category,
        "city": city,
        "count": len(result),
        "locations": result,
    }


@app.get("/cities")
def cities():
    """List supported cities for local recommendations."""
    return {"cities": get_cities()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
