# Smart Recycling Assistant — Hackathon 2026

## Problem (PS06)
Computer Vision system that recognizes recyclable, reusable, biodegradable, and hazardous materials. Generative AI provides disposal recommendations.

## Team Roles
- Person 1 (Vision): Webcam + classification
- Person 2 (AI Brain): Tip generation  <-- OUR ROLE
- Person 3 (UI): Gradio app + integration

## Person 2 Deliverable
Function: generate_tip(label: str) -> str
- Input: Recyclable, Biodegradable, Hazardous, Reusable
- Output: 2-sentence tip
- Model: qwen2.5-coder:7b

## Tech Stack
Python 3.10, ollama, Gradio, OpenCV

## Constraints
No cloud APIs, all local, must run on MacBook
