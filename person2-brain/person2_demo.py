"""Person 2 standalone Gradio demo. No P1/P3 required."""

import gradio as gr

from person2_ai import generate_tip, track_item, get_stats
from waste_items import all_items, get_category
from impact import compute as compute_impact, format_report as impact_report
from analytics import summary_json as analytics_summary

ITEMS = sorted(all_items())


def do_tip(item):
    if not item:
        return "", "", ""
    cat = get_category(item)
    tip = generate_tip(item)
    track_item(item)
    return item, cat, tip


def stats_md():
    stats = get_stats()
    impact = compute_impact()
    lines = [
        "### 🌍 Digital Twin — Live",
        f"**Total items tracked:** {impact['total_items']}",
        "",
        "**By category:**",
    ]
    for cat, n in stats.items():
        lines.append(f"- {cat}: **{n}**")
    lines.append("")
    lines.append(f"**Estimated CO₂ avoided:** {impact['co2_avoided_kg']} kg")
    eq = impact["equivalences"]
    lines.append(f"- 🚗 Driving {eq['km_driven']} km less")
    lines.append(f"- 🌳 {eq['trees_yearly']} trees for a year")
    return "\n".join(lines)


def analytics_md():
    s = analytics_summary()
    lines = ["### 📊 Analytics", f"**Streak:** {s['streak_days']} consecutive days", ""]

    lines.append("**Category breakdown:**")
    for cat, n in s["category_pie"].items():
        lines.append(f"- {cat}: **{n}**")

    lines.append("")
    lines.append("**Top 5 items:**")
    for label, n in s["top_items"][:5]:
        lines.append(f"- {label}: {n}")

    lines.append("")
    lines.append("**Last 7 days:**")
    for d in s["daily_trend"][-7:]:
        bar = "█" * d["total"]
        lines.append(f"- {d['date']}: {d['total']:2d}  {bar}")

    return "\n".join(lines)


with gr.Blocks(title="Person 2 — Waste Disposal Brain") as demo:
    gr.Markdown("# ♻️ Person 2 — The AI Brain")
    gr.Markdown(
        "**1,048-item curated database** · **RAG-grounded tips** · **4,009x cache speedup**"
    )

    with gr.Row():
        with gr.Column():
            item_dd = gr.Dropdown(
                choices=ITEMS,
                value="battery",
                label="Waste item (searchable)",
                allow_custom_value=True,
            )
            tip_btn = gr.Button("Get disposal tip", variant="primary")
            gr.Markdown(
                "**Tip:** Try `battery`, `banana peel`, `old t-shirt`, `paint can`, "
                "`shredded paper`, `neon sign`"
            )

        with gr.Column():
            out_item = gr.Textbox(label="Item")
            out_cat = gr.Textbox(label="Category")
            out_tip = gr.Textbox(label="Tip (grounded via RAG)", lines=3)

    with gr.Row():
        stats_view = gr.Markdown(value=stats_md(), every=3)
        analytics_view = gr.Markdown(value=analytics_md(), every=3)

    tip_btn.click(do_tip, [item_dd], [out_item, out_cat, out_tip])

    gr.Markdown("---")
    gr.Markdown(
        "*Person 2: RAG-grounded waste disposal engine. "
        "1,048 items · 100% reliability · 4.83/5 quality · 4,009x cache*"
    )

if __name__ == "__main__":
    demo.launch()
