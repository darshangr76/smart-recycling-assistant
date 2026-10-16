"""webcam_scanner.py - blur/gray bg + style toggle + smart fallback."""

import os
import time
import json
import tempfile
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np

import vision_engineer as ve

CATEGORY_COLORS = {
    "Recyclable":    (0, 200, 0),
    "Biodegradable": (0, 165, 255),
    "Hazardous":     (0, 0, 255),
    "Reusable":      (255, 200, 0),
}
RESULT_DISPLAY_SECONDS = 6
SCANS_DIR = Path("scans")
LOG_FILE = Path("scan_log.jsonl")
ROI_SIZE_RATIO = 0.55
CROP_RESIZE = 384
BG_STYLES = ["blur_gray", "blackout", "vignette", "dim"]
_bg_style_index = 0


def _overlay_text(frame, text, y, color=(255, 255, 255), scale=0.7, thickness=2):
    cv2.putText(frame, text, (12, y), cv2.FONT_HERSHEY_SIMPLEX,
                scale, (0, 0, 0), thickness + 3, cv2.LINE_AA)
    cv2.putText(frame, text, (12, y), cv2.FONT_HERSHEY_SIMPLEX,
                scale, color, thickness, cv2.LINE_AA)


def _draw_banner(frame, text, color):
    h, w = frame.shape[:2]
    banner_h = 70
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, h - banner_h), (w, h), color, -1)
    cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
    cv2.putText(frame, text, (20, h - 25), cv2.FONT_HERSHEY_SIMPLEX,
                0.85, (255, 255, 255), 2, cv2.LINE_AA)


def _draw_stats(frame, stats):
    h, w = frame.shape[:2]
    x = w - 270
    y = 40
    cv2.putText(frame, "SESSION STATS", (x, y), cv2.FONT_HERSHEY_SIMPLEX,
                0.5, (255, 255, 255), 1, cv2.LINE_AA)
    y += 25
    for cat in ["Recyclable", "Biodegradable", "Hazardous", "Reusable"]:
        count = stats.get(cat, 0)
        color = CATEGORY_COLORS[cat]
        cv2.putText(frame, f"{cat}: {count}", (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
        y += 22


def _compute_roi(frame):
    h, w = frame.shape[:2]
    side = int(min(h, w) * ROI_SIZE_RATIO)
    cx, cy = w // 2, h // 2
    return cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2


def _apply_background_style(frame, roi, style):
    x1, y1, x2, y2 = roi
    mask = np.zeros(frame.shape[:2], dtype=np.uint8)
    mask[y1:y2, x1:x2] = 255
    inv_mask = cv2.bitwise_not(mask)

    if style == "blackout":
        bg = np.zeros_like(frame)

    elif style == "blur_gray":
        blurred = cv2.GaussianBlur(frame, (71, 71), 0)
        gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
        bg = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    elif style == "vignette":
        blurred = cv2.GaussianBlur(frame, (51, 51), 0)
        darkened = (blurred * 0.25).astype(np.uint8)
        h, w = frame.shape[:2]
        Y, X = np.ogrid[:h, :w]
        cx, cy = w // 2, h // 2
        dist = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
        max_dist = np.sqrt(cx ** 2 + cy ** 2)
        vignette = np.clip(1.0 - (dist / max_dist) * 1.4, 0, 1)
        bg = (darkened.astype(np.float32) * vignette[..., None]).astype(np.uint8)

    else:  # dim
        bg = (frame * 0.35).astype(np.uint8)

    bg_only = cv2.bitwise_and(bg, bg, mask=inv_mask)
    roi_only = cv2.bitwise_and(frame, frame, mask=mask)
    return cv2.add(bg_only, roi_only)


def _draw_roi(frame, roi, color=(255, 255, 255)):
    x1, y1, x2, y2 = roi
    length = 35
    thickness = 3
    for (a, b, c, d) in [((x1, y1), (x1 + length, y1), (x1, y1), (x1, y1 + length)),
                         ((x2, y1), (x2 - length, y1), (x2, y1), (x2, y1 + length)),
                         ((x1, y2), (x1 + length, y2), (x1, y2), (x1, y2 - length)),
                         ((x2, y2), (x2 - length, y2), (x2, y2), (x2, y2 - length))]:
        cv2.line(frame, a, b, color, thickness)


def _save_scan(crop, label, confidence, reason, engine):
    SCANS_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = SCANS_DIR / f"{ts}_{label}_{confidence}pct_{engine}.jpg"
    cv2.imwrite(str(filename), crop)
    entry = {"timestamp": datetime.now().isoformat(),
             "label": label, "confidence": confidence,
             "reason": reason, "engine": engine, "file": str(filename)}
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
    return filename


def _resize_crop(crop, target=CROP_RESIZE):
    h, w = crop.shape[:2]
    scale = target / max(h, w)
    if scale >= 1.0:
        return crop
    return cv2.resize(crop, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)


def _do_scan(crop, engine_key):
    resized = _resize_crop(crop)
    tmp = os.path.join(tempfile.gettempdir(),
                       f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
    cv2.imwrite(tmp, resized)

    try:
        if engine_key == "gemini":
            result = ve._call_gemini(tmp)
        else:
            result = ve._call_qwen(tmp)

        if result is None:
            other = "qwen" if engine_key == "gemini" else "gemini"
            print(f"[Scanner] {engine_key} failed - trying {other}")
            if other == "gemini":
                result = ve._call_gemini(tmp)
            else:
                result = ve._call_qwen(tmp)

        if result is None:
            result = {"label": "Recyclable", "confidence": 0, "reason": "scan failed"}
    finally:
        try:
            os.remove(tmp)
        except OSError:
            pass

    return result, crop


def run_scanner(camera_index=0):
    global _bg_style_index
    print("=" * 60)
    print("  Smart Recycling - Vision Scanner")
    print("  [S] Scan  [G] Gemini  [Q] Qwen  [T] Toggle  [B] BG-style  [X] Quit")
    print("=" * 60)

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print("[Scanner] Could not open webcam.")
        return
    print("[Scanner] Webcam opened.\n")

    current_engine = "qwen"  # Default to Qwen (reliable, offline, no quota)
    stats = {c: 0 for c in CATEGORY_COLORS}
    last_result = None
    last_confidence = 0
    last_reason = ""
    last_result_time = 0.0
    last_thumbnail = None
    session_start = time.time()
    gemini_blocked = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        roi = _compute_roi(frame)
        style = BG_STYLES[_bg_style_index]
        display = _apply_background_style(frame, roi, style)
        _draw_roi(display, roi, color=(255, 255, 255))

        _overlay_text(display,
                      "[S] Scan  [G] Gemini  [Q] Qwen  [T] Toggle  [B] BG  [X] Quit",
                      30, color=(255, 255, 255), scale=0.5, thickness=1)

        if current_engine == "gemini" and gemini_blocked:
            engine_label = "GEMINI (quota exhausted)"
            engine_color = (0, 0, 255)
        else:
            engine_label = "GEMINI" if current_engine == "gemini" else "QWEN"
            engine_color = (0, 255, 0) if current_engine == "gemini" else (0, 200, 255)
        _overlay_text(display, f"Engine: {engine_label}", 55,
                      color=engine_color, scale=0.6, thickness=2)

        _overlay_text(display, f"BG: {style}", 80,
                      color=(200, 200, 200), scale=0.5, thickness=1)

        _draw_stats(display, stats)

        if last_thumbnail is not None:
            th, tw = last_thumbnail.shape[:2]
            scale = 120 / max(th, tw)
            nw, nh = int(tw * scale), int(th * scale)
            thumb = cv2.resize(last_thumbnail, (nw, nh))
            ox, oy = 20, 120
            display[oy:oy+nh, ox:ox+nw] = thumb
            color = CATEGORY_COLORS.get(last_result or "", (255, 255, 255))
            cv2.rectangle(display, (ox-2, oy-2), (ox+nw+2, oy+nh+2), color, 2)

        if last_result and (time.time() - last_result_time < RESULT_DISPLAY_SECONDS):
            color = CATEGORY_COLORS.get(last_result, (255, 255, 255))
            _draw_banner(display,
                         f"{last_result}  ({last_confidence}%)  -  {last_reason[:60]}",
                         color)
        elif last_reason and "no object" in last_reason.lower() and (time.time() - last_result_time < RESULT_DISPLAY_SECONDS):
            _draw_banner(display, "No object detected - try again", (100, 100, 100))

        cv2.imshow("Smart Recycling - Vision Scanner", display)
        key = cv2.waitKey(1) & 0xFF

        if key in (ord('x'), 27):
            print("[Scanner] Quitting.")
            break

        if key == ord('g') and ve.GEMINI_ENABLED:
            if gemini_blocked:
                print("[Scanner] Gemini is quota-blocked. Try again tomorrow.")
            else:
                current_engine = "gemini"
                print("[Scanner] Engine -> GEMINI")

        if key == ord('q') and ve.QWEN_ENABLED:
            current_engine = "qwen"
            print("[Scanner] Engine -> QWEN")

        if key == ord('t'):
            if gemini_blocked and current_engine == "qwen":
                print("[Scanner] Gemini is quota-blocked, staying on QWEN.")
            else:
                current_engine = "qwen" if current_engine == "gemini" else "gemini"
                print(f"[Scanner] Engine toggled -> {current_engine.upper()}")

        if key == ord('b'):
            _bg_style_index = (_bg_style_index + 1) % len(BG_STYLES)
            print(f"[Scanner] Background style -> {BG_STYLES[_bg_style_index]}")

        if key == ord('s'):
            if current_engine == "gemini" and gemini_blocked:
                print("[Scanner] Gemini quota exhausted - auto-switching to QWEN")
                current_engine = "qwen"

            print(f"\n[Scanner] Scan requested. Engine: {current_engine}")
            x1, y1, x2, y2 = roi
            crop = frame[y1:y2, x1:x2].copy()

            _draw_banner(display, f"Scanning with {current_engine.upper()}...",
                         (60, 60, 60))
            cv2.imshow("Smart Recycling - Vision Scanner", display)
            cv2.waitKey(1)

            if current_engine == "gemini" and not gemini_blocked:
                result, saved_crop = _do_scan(crop, "gemini")
                bad = (result is None or
                       result.get("confidence", 0) == 0 or
                       "failed" in result.get("reason", "").lower() or
                       "timeout" in result.get("reason", "").lower() or
                       "error" in result.get("reason", "").lower())
                if bad:
                    print("[Scanner] Gemini failed/slow - blocking and switching to Qwen...")
                    gemini_blocked = True
                    current_engine = "qwen"
                    result, saved_crop = _do_scan(crop, "qwen")
            else:
                result, saved_crop = _do_scan(crop, current_engine)

            label = result["label"]
            confidence = result["confidence"]
            reason = result["reason"]

            if "no object" in reason.lower() or (confidence == 0 and "detected" in reason.lower()):
                print(f"[Scanner] SKIPPED - {reason}")
                last_result = None
                last_reason = reason
                last_result_time = time.time()
                for _ in range(5):
                    cv2.waitKey(1)
                continue

            stats[label] = stats.get(label, 0) + 1
            last_result = label
            last_confidence = confidence
            last_reason = reason
            last_result_time = time.time()
            last_thumbnail = saved_crop

            saved = _save_scan(saved_crop, label, confidence, reason, current_engine)
            print(f"[Scanner] {label} ({confidence}%) - {reason}")
            print(f"[Scanner] Saved -> {saved}")

            for _ in range(5):
                cv2.waitKey(1)

    cap.release()
    cv2.destroyAllWindows()

    duration = time.time() - session_start
    print("\n" + "=" * 60)
    print("  SESSION SUMMARY")
    print("=" * 60)
    total = sum(stats.values())
    for cat, count in stats.items():
        print(f"  {cat:<15}: {count}")
    print(f"  {'TOTAL':<15}: {total}")
    print(f"  Duration       : {duration/60:.1f} minutes")
    print("=" * 60)


if __name__ == "__main__":
    run_scanner()
