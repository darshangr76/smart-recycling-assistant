"""Minimal Gradio frontend to test Person 2's subagents."""

import json
import time
from pathlib import Path

import gradio as gr
import requests

OLLAMA = "http://localhost:11434/api/generate"
AGENTS_DIR = Path(".agents/agents")
MODEL = "qwen2.5-coder:3b"


def list_agents():
    if not AGENTS_DIR.exists():
        return ["(no agents found)"]
    names = sorted(p.stem for p in AGENTS_DIR.glob("*.md"))
    return names or ["(empty)"]


def load_agent(name):
    """Read agent markdown spec. Returns (frontmatter, body)."""
    path = AGENTS_DIR / f"{name}.md"
    if not path.exists():
        return None, None
    text = path.read_text()
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            return parts[1].strip(), parts[2].strip()
    return "", text


def run_agent(agent_name, task):
    """Run one agent with a task. Returns a formatted trace."""
    if not agent_name or not task:
        return "⚠️ Pick an agent and enter a task"

    frontmatter, body = load_agent(agent_name)
    if body is None:
        return f"❌ Agent '{agent_name}' not found in {AGENTS_DIR}"

    full_prompt = f"""{body}

---

TASK: {task}

Respond concisely with your plan + answer.
"""
    trace = []
    trace.append(f"## 🧠 Agent: `{agent_name}`\n")
    trace.append(f"**Model:** `{MODEL}`\n")
    if frontmatter:
        trace.append(f"**Spec (frontmatter):**\n```yaml\n{frontmatter}\n```\n")
    trace.append(f"**Task:** {task}\n")
    trace.append("---\n")
    trace.append("### 📤 Prompt sent to LLM\n")
    trace.append(f"```\n{body[:400]}{'...' if len(body) > 400 else ''}\n```\n")
    trace.append("---\n")
    trace.append("### 📥 Agent response\n")

    t0 = time.time()
    try:
        r = requests.post(
            OLLAMA,
            json={
                "model": MODEL,
                "prompt": full_prompt,
                "stream": False,
                "options": {"temperature": 0.3, "num_predict": 500},
            },
            timeout=180,
        )
        r.raise_for_status()
        data = r.json()
        out = (data.get("response") or "").strip()
        if not out and data.get("thinking"):
            out = data["thinking"].strip()
        if not out:
            out = "(empty response)"
        dt = time.time() - t0
        trace.append(out)
        trace.append(f"\n---\n*⏱ {dt:.2f}s · {data.get('eval_count', '?')} tokens*")
    except Exception as e:
        trace.append(f"❌ Error: {e}")

    return "\n".join(trace)


def preview_agent(name):
    """Show the agent spec when selected."""
    frontmatter, body = load_agent(name)
    if body is None:
        return ""
    out = [f"### 📄 Spec preview: `{name}`\n"]
    if frontmatter:
        out.append(f"```yaml\n{frontmatter}\n```\n")
    out.append(f"**Body:**\n```\n{body[:600]}{'...' if len(body) > 600 else ''}\n```")
    return "\n".join(out)


AGENTS = list_agents()

with gr.Blocks(title="Subagent Tester") as demo:
    gr.Markdown("# �� Subagent Tester")
    gr.Markdown(
        f"**Available agents:** {', '.join(AGENTS)}  \n"
        f"**Model:** `{MODEL}` · **Ollama:** `{OLLAMA}`"
    )

    with gr.Row():
        with gr.Column(scale=1):
            agent_dd = gr.Dropdown(
                choices=AGENTS,
                value=AGENTS[0] if AGENTS else None,
                label="Pick an agent",
            )
            task_tb = gr.Textbox(
                label="Task",
                value="Generate a disposal tip for a battery.",
                lines=3,
            )
            run_btn = gr.Button("▶️ Run agent", variant="primary")

            gr.Examples(
                examples=[
                    ["tip-generator", "Generate a disposal tip for a battery."],
                    ["tip-generator", "Generate a disposal tip for an old t-shirt."],
                    ["vision-classifier", "How would you classify an image of a plastic bottle?"],
                    ["vision-classifier", "What qwen3-vl settings do you need for consistent output?"],
                    ["ui-builder", "Outline the Gradio UI you would build for the recycling demo."],
                ],
                inputs=[agent_dd, task_tb],
            )

        with gr.Column(scale=2):
            spec_view = gr.Markdown()
            output = gr.Markdown()

    agent_dd.change(preview_agent, [agent_dd], [spec_view])
    run_btn.click(run_agent, [agent_dd, task_tb], [output])

    demo.load(preview_agent, [agent_dd], [spec_view])

    gr.Markdown("---")
    gr.Markdown(
        "*Internal testing tool — not Person 3's production UI. "
        "Uses Ollama with qwen2.5-coder:3b.*"
    )


if __name__ == "__main__":
    demo.launch()
