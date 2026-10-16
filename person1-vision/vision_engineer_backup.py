"""
vision_engineer.py - word-boundary override + face-safe classification.
"""

import os
import re
import json
import time
import hashlib
from pathlib import Path
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FTimeout

from PIL import Image

VALID_CATEGORIES = ["Recyclable", "Biodegradable", "Hazardous", "Reusable"]
DEFAULT_FALLBACK = "Recyclable"
MAX_RETRIES = 1
RETRY_DELAY_SECONDS = 1
MIN_CONFIDENCE = 50
GEMINI_MODELS = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"]
QWEN_MODEL = "qwen2.5vl:3b"
GEMINI_TIMEOUT = 20
QWEN_TIMEOUT = 90

MATERIAL_OVERRIDES = {
    "Recyclable": [r"\bcan\b", r"\baluminum\b", r"\baluminium\b", r"\btin\b",
                   r"\bsoda\b", r"\bcoke\b", r"\bpepsi\b", r"\bfanta\b",
                   r"\bsprite\b", r"\bmonster\b", r"\bbottle\b",
                   r"\bglass jar\b", r"\bjar\b", r"\bpaper\b", r"\bcardboard\b",
                   r"\bnewspaper\b", r"\bmagazine\b", r"\bmetal can\b",
                   r"\bsteel can\b", r"\bfoil\b", r"\bwrapper\b", r"\bcarton\b"],
    "Biodegradable": [r"\bapple\b", r"\bbanana\b", r"\borange\b", r"\bpeel\b",
                      r"\bcore\b", r"\bfruit\b", r"\bvegetable\b", r"\bfood\b",
                      r"\bleaf\b", r"\bleaves\b", r"\bbread\b", r"\brice\b",
                      r"\bleftover\b", r"\bcompost\b", r"\bcoffee ground\b",
                      r"\btea bag\b", r"\beggshell\b"],
    "Hazardous": [r"\bbattery\b", r"\baa battery\b", r"\baaa battery\b",
                  r"\blithium\b", r"\bswollen battery\b", r"\bchemical\b",
                  r"\bpesticide\b", r"\bpaint\b", r"\bsolvent\b", r"\bsyringe\b",
                  r"\bneedle\b", r"\bmedical waste\b", r"\bmedicine\b",
                  r"\bpill\b", r"\bthermometer\b", r"\bmercury\b", r"\bcfl\b",
                  r"\bfluorescent\b", r"\be-waste\b"],
    "Reusable": [r"\bheadphone\b", r"\bheadset\b", r"\bearphone\b",
                 r"\bearbud\b", r"\bairpod\b", r"\bphone\b", r"\bsmartphone\b",
                 r"\bmobile\b", r"\blaptop\b", r"\bcomputer\b", r"\btablet\b",
                 r"\bipad\b", r"\bpower bank\b", r"\bpowerbank\b",
                 r"\bcharger\b", r"\bcable\b", r"\badapter\b", r"\bkeyboard\b",
                 r"\bmouse\b", r"\bcamera\b", r"\bspeaker\b", r"\bmonitor\b",
                 r"\btv\b", r"\bremote\b", r"\bwatch\b", r"\bsmartwatch\b",
                 r"\bconsole\b", r"\brouter\b", r"\bprinter\b", r"\bpouch\b",
                 r"\bbag\b", r"\bbackpack\b", r"\bjacket\b", r"\bshirt\b",
                 r"\bshoe\b", r"\bcontainer\b", r"\btupperware\b",
                 r"\bkeychain\b", r"\bglasses\b", r"\beyeglasses\b",
                 r"\bsunglasses\b", r"\bglass with lid\b", r"\bbox with lid\b"],
}
DEVICE_KEYWORDS = ["laptop", "computer", "phone", "smartphone", "mobile",
                   "headset", "headphone", "earbud", "earphone", "airpod",
                   "power bank", "powerbank", "charger", "adapter", "tablet",
                   "ipad", "mouse", "keyboard", "camera", "speaker", "monitor",
                   "screen", "tv", "television", "remote", "watch",
                   "smartwatch", "console", "router", "printer", "scanner",
                   "drone", "gadget", "device", "electronics", "electronic",
                   "glasses", "eyeglasses", "sunglasses", "keychain"]
DAMAGE_KEYWORDS = ["broken", "swollen", "damaged", "cracked", "leaking",
                   "burnt", "burned", "exposed", "torn", "shattered"]

SKIP_OBJECTS = [r"\bman\b", r"\bwoman\b", r"\bperson\b",
                r"\bhuman\b", r"\bbody\b", r"\bfinger\b",
                r"\bwall\b", r"\bceiling\b", r"\bfloor\b",
                r"\bbackground\b", r"\bnothing\b", r"\bempty\b"]
QWEN_ENABLED = False
try:
    import ollama
    QWEN_ENABLED = True
except ImportError:
    print("[Vision] ollama not installed")

GEMINI_ENABLED = bool(os.environ.get("GEMINI_API_KEY"))
_gemini_models = []
if GEMINI_ENABLED:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        for m in GEMINI_MODELS:
            try:
                _gemini_models.append((m, genai.GenerativeModel(m)))
            except Exception as e:
                print(f"[Vision] Gemini model {m} init failed: {e}")
    except Exception as e:
        print(f"[Vision] Gemini init failed: {e}")
        GEMINI_ENABLED = False

if not QWEN_ENABLED and not GEMINI_ENABLED:
    raise EnvironmentError("No vision engine available.")

_cache = OrderedDict()
_CACHE_MAX = 200

_QWEN_IDENTIFY_PROMPT = """What is the main object in this image?

Answer with ONLY the object name (2-5 words).
Examples: "aluminum soda can", "wired headphones", "plastic water bottle", "apple core".

If the image shows a person, face, wall, or empty scene, answer: "no object".

Answer:"""

_QWEN_CLASSIFY_TEMPLATE = """Object identified as: "{object_name}"

Classify into ONE category based on these EXAMPLES:

EXAMPLES:
- "soda can"          -> Recyclable
- "plastic bottle"    -> Recyclable
- "glass jar"         -> Recyclable
- "cardboard box"     -> Recyclable
- "apple core"        -> Biodegradable
- "banana peel"       -> Biodegradable
- "loose AA battery"  -> Hazardous
- "swollen battery"   -> Hazardous
- "wired headphones"  -> Reusable
- "smartphone"        -> Reusable
- "laptop"            -> Reusable
- "power bank"        -> Reusable
- "blue pouch"        -> Reusable
- "backpack"          -> Reusable
- "glasses"           -> Reusable
- "keychain"          -> Reusable

Now classify "{object_name}":

Rules:
1. Only "Hazardous" for loose batteries, chemicals, syringes.
2. Intact devices and containers -> "Reusable".
3. Food and organic waste -> "Biodegradable".
4. Cans, bottles, paper, cardboard -> "Recyclable".
5. If object is a device or container that's intact -> "Reusable" (NOT Biodegradable).

Output ONLY JSON:
{{"label": "Recyclable OR Biodegradable OR Hazardous OR Reusable", "confidence": <0-100>, "reason": "<short phrase about {object_name}>"}}"""

_GEMINI_PROMPT = """You are a smart recycling assistant AI. Identify the object, then classify it.

STEP 1 - Identify: What is the object?
STEP 2 - Classify into EXACTLY ONE category:

- "Recyclable"     -> Plastic bottles, glass jars, aluminum cans, paper, cardboard, metal tins
- "Biodegradable"  -> Food scraps, fruit peels, garden waste, compostable packaging
- "Hazardous"      -> ONLY loose batteries, swollen/broken electronics, chemicals, syringes
- "Reusable"       -> INTACT electronics, intact containers, jars, bags, clothing, furniture

CRITICAL RULES:
1. HAZARDOUS IS RARE - only if the object is DANGEROUS to handle.
2. A soda can is "Recyclable".
3. An intact headset/phone/laptop/power bank/glasses is "Reusable".
4. If intact and functional, it CANNOT be "Hazardous".
5. Intact devices are NEVER "Biodegradable".

In the "reason" field, describe THIS specific object.

Output ONLY this JSON:
{"label": "<category>", "confidence": <0-100>, "reason": "<10 words about THIS object>"}
"""


def _hash_image(p):
    with open(p, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def _cache_get(k):
    if k in _cache:
        _cache.move_to_end(k)
        return _cache[k]
    return None


def _cache_set(k, v):
    _cache[k] = v
    _cache.move_to_end(k)
    while len(_cache) > _CACHE_MAX:
        _cache.popitem(last=False)


def _clean_raw(raw):
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _extract_json(text):
    text = _clean_raw(text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*?\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {}


def _normalize_label(label):
    if not label:
        return None
    label = str(label).strip().capitalize()
    for cat in VALID_CATEGORIES:
        if cat.lower() == label.lower():
            return cat
    return None


def _safe_confidence(value):
    try:
        return max(0, min(100, int(value)))
    except (ValueError, TypeError):
        return 0


def _is_skip_object(object_name):
    obj = object_name.lower()
    for pattern in SKIP_OBJECTS:
        if re.search(pattern, obj):
            return True
    return False


def _apply_material_override(label, reason, object_name):
    combined = (object_name + " " + reason).lower()
    if any(re.search(r"\b" + re.escape(kw) + r"\b", combined) for kw in DAMAGE_KEYWORDS):
        return label, reason
    ORDERED = ["Reusable", "Hazardous", "Biodegradable", "Recyclable"]
    for category in ORDERED:
        patterns = MATERIAL_OVERRIDES[category]
        for pattern in patterns:
            if re.search(pattern, combined):
                if label != category:
                    print(f"[Vision] Material override: {label} -> {category}")
                    return category, object_name + " - " + category.lower()
                return label, reason
    


def _apply_device_override(label, reason, object_name=""):
    combined = (reason + " " + object_name).lower()
    is_device = any(kw in combined for kw in DEVICE_KEYWORDS)
    is_damaged = any(kw in combined for kw in DAMAGE_KEYWORDS)
    if is_device and not is_damaged and label in ("Hazardous", "Biodegradable"):
        print(f"[Vision] Device override: {label} -> Reusable")
        return "Reusable", "intact electronic device - reusable"
    return label, reason


def _apply_overrides(label, reason, object_name=""):
    label, reason = _apply_material_override(label, reason, object_name)
    label, reason = _apply_device_override(label, reason, object_name)
    return label, reason


def _parse_response(raw, object_name=""):
    data = _extract_json(raw)
    label = _normalize_label(data.get("label"))
    if not label:
        match = re.search(r"(Recyclable|Biodegradable|Hazardous|Reusable)", raw, re.IGNORECASE)
        if match:
            label = match.group(1).capitalize()
    if not label:
        return None
    confidence = _safe_confidence(data.get("confidence", 0))
    if confidence == 0 and data.get("label"):
        confidence = 60
    reason = str(data.get("reason", "")).strip() or "classified"
    label, reason = _apply_overrides(label, reason, object_name)
    return {"label": label, "confidence": confidence, "reason": reason}


def _run_with_timeout(fn, timeout, *args, **kwargs):
    with ThreadPoolExecutor(max_workers=1) as ex:
        fut = ex.submit(fn, *args, **kwargs)
        try:
            return fut.result(timeout=timeout)
        except FTimeout:
            print(f"[Vision] Timeout after {timeout}s")
            return None
        except Exception as e:
            print(f"[Vision] Error: {e}")
            return None


def _call_qwen_inner(image_path, extra_nudge):
    print("[Vision] Qwen Step 1: identifying object...")
    start = time.time()
    id_resp = ollama.chat(
        model=QWEN_MODEL,
        messages=[{"role": "user", "content": _QWEN_IDENTIFY_PROMPT, "images": [image_path]}],
        options={"temperature": 0.0},
    )
    object_name = id_resp["message"]["content"].strip()
    object_name = re.sub(r'^["\'\s]+|["\'\s]+$', '', object_name)
    object_name = object_name.split("\n")[0].strip()[:60]
    print(f"[Vision] Qwen Step 1 ({time.time()-start:.1f}s): '{object_name}'")

    if _is_skip_object(object_name) or object_name.lower() == "no object":
        print("[Vision] Skipping - no waste object detected")
        return {"label": "Recyclable", "confidence": 0,
                "reason": f"no object detected ({object_name})"}

    classify_prompt = _QWEN_CLASSIFY_TEMPLATE.format(object_name=object_name)
    if extra_nudge:
        classify_prompt += "\n\nNote: " + extra_nudge

    print("[Vision] Qwen Step 2: classifying...")
    start = time.time()
    cls_resp = ollama.chat(
        model=QWEN_MODEL,
        messages=[{"role": "user", "content": classify_prompt, "images": [image_path]}],
        options={"temperature": 0.1},
    )
    raw = cls_resp["message"]["content"]
    print(f"[Vision] Qwen Step 2 ({time.time()-start:.1f}s): {raw[:200]!r}")
    return _parse_response(raw, object_name=object_name)


def _call_qwen(image_path, extra_nudge=""):
    return _run_with_timeout(_call_qwen_inner, QWEN_TIMEOUT, image_path, extra_nudge)


def _call_gemini_inner(image_path, extra_nudge, model_name, model):
    prompt = _GEMINI_PROMPT
    if extra_nudge:
        prompt += "\n\nNote: " + extra_nudge
    pil_image = Image.open(image_path).convert("RGB")
    print(f"[Vision] Trying Gemini ({model_name})...")
    start = time.time()
    response = model.generate_content(
        [prompt, pil_image],
        generation_config={"temperature": 0.1, "max_output_tokens": 500},
    )
    raw = response.text
    print(f"[Vision] Gemini {model_name} ({time.time()-start:.1f}s): {raw[:200]!r}")
    return _parse_response(raw)


def _call_gemini(image_path, extra_nudge=""):
    for model_name, model in _gemini_models:
        result = _run_with_timeout(
            _call_gemini_inner, GEMINI_TIMEOUT, image_path, extra_nudge, model_name, model
        )
        if result:
            return result
        print(f"[Vision] {model_name} failed, trying next...")
    return None


def _try_engine(engine_name, engine_fn, image_path):
    best = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            nudge = ""
            if best:
                nudge = f"Previous attempt was '{best['label']}' at {best['confidence']}% confidence."
            result = engine_fn(image_path, extra_nudge=nudge)
            if not result:
                continue
            if best is None or result["confidence"] > best["confidence"]:
                best = result
            if result["confidence"] >= MIN_CONFIDENCE:
                print(f"[Vision] {engine_name} -> {result['label']} ({result['confidence']}%)")
                return result
            time.sleep(RETRY_DELAY_SECONDS)
        except Exception as e:
            print(f"[Vision] {engine_name} attempt {attempt} failed: {str(e)[:150]}")
            time.sleep(RETRY_DELAY_SECONDS)
    return best


def classify_waste_full(image_path):
    path = Path(image_path)
    if not path.exists():
        return {"label": DEFAULT_FALLBACK, "confidence": 0, "reason": "file not found"}

    try:
        ck = _hash_image(image_path)
        cached = _cache_get(ck)
        if cached:
            print(f"[Vision] Cache HIT -> {cached['label']} ({cached['confidence']}%)")
            return cached
    except Exception as e:
        print(f"[Vision] cache error: {e}")
        ck = None

    result = None

    if QWEN_ENABLED:
        result = _try_engine("Qwen", _call_qwen, image_path)

    if (result is None or result["confidence"] < MIN_CONFIDENCE) and GEMINI_ENABLED:
        print("[Vision] Falling back to Gemini...")
        gemini_result = _try_engine("Gemini", _call_gemini, image_path)
        if gemini_result and (result is None or gemini_result["confidence"] > result["confidence"]):
            result = gemini_result

    if result is None:
        result = {"label": DEFAULT_FALLBACK, "confidence": 0, "reason": "all engines failed"}

    if ck:
        _cache_set(ck, result)
    return result


def classify_waste(image_path):
    return classify_waste_full(image_path)["label"]


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python vision_engineer.py <path>")
        sys.exit(1)
    print(classify_waste_full(sys.argv[1]))
