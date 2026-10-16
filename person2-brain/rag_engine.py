"""
RAG engine for Person 2.
- Embeds guideline chunks with nomic-embed-text (via Ollama)
- Caches embeddings to rag_index.json
- retrieve(query) returns top-k relevant chunks
"""

import json
import math
import os
import requests
from pathlib import Path

from rag_docs import GUIDELINES

OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBED_MODEL = "nomic-embed-text:latest"
INDEX_FILE = Path("rag_index.json")
DEBUG = os.environ.get("RAG_DEBUG") == "1"


def _embed(text: str) -> list:
    """Embed a single string. Returns a list of floats."""
    r = requests.post(OLLAMA_URL, json={
        "model": EMBED_MODEL,
        "prompt": text,
    }, timeout=30)
    r.raise_for_status()
    return r.json()["embedding"]


def _cosine(a: list, b: list) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def build_index(force: bool = False) -> dict:
    """Build (or load) the embedded guideline index."""
    if INDEX_FILE.exists() and not force:
        try:
            data = json.loads(INDEX_FILE.read_text())
            if len(data.get("chunks", [])) == len(GUIDELINES):
                if DEBUG:
                    print(f"[rag] loaded index from {INDEX_FILE}")
                return data
        except Exception:
            pass

    print(f"[rag] building index for {len(GUIDELINES)} chunks...")
    chunks = []
    for i, g in enumerate(GUIDELINES, 1):
        text = f"{g['topic']}: {g['text']}"
        try:
            vec = _embed(text)
            chunks.append({
                "id": g["id"],
                "topic": g["topic"],
                "text": g["text"],
                "embedding": vec,
            })
            if i % 5 == 0 or i == len(GUIDELINES):
                print(f"  [{i}/{len(GUIDELINES)}] {g['id']}")
        except Exception as e:
            print(f"  [error] {g['id']}: {e}")

    data = {"model": EMBED_MODEL, "chunks": chunks}
    INDEX_FILE.write_text(json.dumps(data))
    print(f"[rag] saved index to {INDEX_FILE}")
    return data


def retrieve(query: str, top_k: int = 3, min_score: float = 0.0) -> list:
    """Return top-k relevant chunks for a query.
    If min_score > 0, filter out weak matches below that cosine similarity."""
    if not query or not query.strip():
        return []

    index = build_index()
    if not index.get("chunks"):
        return []

    try:
        q_vec = _embed(query)
    except Exception as e:
        if DEBUG:
            print(f"[rag] embed failed: {e}")
        return []

    scored = []
    for chunk in index["chunks"]:
        score = _cosine(q_vec, chunk["embedding"])
        scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)

    # Filter by min_score if requested
    if min_score > 0:
        scored = [(s, c) for s, c in scored if s >= min_score]

    top = scored[:top_k]

    if DEBUG:
        print(f"[rag] query='{query}' -> top {len(top)} (min_score={min_score}):")
        for s, c in top:
            print(f"  {s:.3f}  {c['id']}  {c['topic']}")

    return [
        {"id": c["id"], "topic": c["topic"], "text": c["text"], "score": round(s, 3)}
        for s, c in top
    ]


def format_context(chunks: list) -> str:
    """Format retrieved chunks as context for the LLM."""
    if not chunks:
        return ""
    lines = ["RELEVANT GUIDELINES (authoritative, cite if useful):"]
    for c in chunks:
        lines.append(f"- [{c['topic']}] {c['text']}")
    return "\n".join(lines)


if __name__ == "__main__":
    import sys

    print("Building RAG index (may take ~30s first time)...")
    build_index()

    # Test queries
    tests = ["battery", "shredded paper", "old t-shirt", "paint", "plastic bag"]
    for q in tests:
        print(f"\nQuery: {q}")
        results = retrieve(q, top_k=2)
        for r in results:
            print(f"  [{r['score']}] {r['topic']}")
