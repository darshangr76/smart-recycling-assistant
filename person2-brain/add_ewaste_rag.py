"""Add e-waste guideline chunks to rag_docs.py for better retrieval."""

from pathlib import Path

NEW_CHUNKS = [
    {
        "id": "ewaste-11",
        "topic": "AirPods and wireless earbuds",
        "text": "AirPods, wireless earbuds, and true-wireless headphones contain lithium-ion batteries in both the buds and the charging case. They must never go in regular trash or curbside recycling. Take them to an e-waste drop-off (Best Buy, Staples, or your municipality's HHW facility). Wipe/erase before disposal."
    },
    {
        "id": "ewaste-12",
        "topic": "Headphones and audio devices",
        "text": "Wired and Bluetooth headphones contain copper wiring, small circuit boards, and often lithium batteries. Take them to an e-waste recycler or manufacturer take-back program. Donate functional pairs to thrift stores or schools. Never place in regular trash."
    },
    {
        "id": "ewaste-13",
        "topic": "Power banks and portable chargers",
        "text": "Power banks contain lithium-ion cells that can cause fires if punctured. Tape the terminals with clear tape, place each in a separate bag, and take to an e-waste or battery drop-off. Never place in curbside recycling or trash."
    },
    {
        "id": "ewaste-14",
        "topic": "Small electronics and accessories",
        "text": "Small electronics like smartwatches, fitness trackers, wireless chargers, keyboards, and mice contain recoverable metals and often lithium batteries. Take to e-waste drop-off or manufacturer take-back. Wipe data first if the device has storage."
    },
]


def main():
    p = Path("rag_docs.py")
    src = p.read_text()
    if "ewaste-11" in src:
        print("Already applied.")
        return

    lines = ["", "# ─── EWaste additions ───", "_EWASTE_RAG = ["]
    for c in NEW_CHUNKS:
        lines.append("    {")
        lines.append(f'        "id": "{c["id"]}",')
        lines.append(f'        "topic": "{c["topic"]}",')
        # Escape quotes in text
        text = c["text"].replace('"', '\\"')
        lines.append(f'        "text": "{text}",')
        lines.append("    },")
    lines.append("]")
    lines.append("for _c in _EWASTE_RAG:")
    lines.append("    if not any(g['id'] == _c['id'] for g in GUIDELINES):")
    lines.append("        GUIDELINES.append(_c)")
    lines.append("del _EWASTE_RAG")
    lines.append("")

    marker = 'if __name__ == "__main__":'
    new_src = src.replace(marker, "\n".join(lines) + "\n" + marker)
    p.write_text(new_src)
    print(f"Added {len(NEW_CHUNKS)} e-waste RAG chunks.")


if __name__ == "__main__":
    main()
