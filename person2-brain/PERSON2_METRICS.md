# Person 2 - The AI Brain

## Performance Metrics

### Reliability (Stress Test)

- **Items processed:** 4249
- **Success rate:** 100.0%
- **Errors:** 0
- **Total runtime:** 342.5s (verified on 513-item run)

### Caching

- **Cold latency:** 0.658s
- **Cached latency:** 0.0002s
- **Speedup:** **4009.6x**

### Tip Quality (LLM-as-judge)

- **Avg score:** 4.83 / 5.00
- **Low-quality items (<3.5):** 0
- **Items evaluated:** 20

## Architecture

- 3-layer fallback: primary LLM -> fallback LLM -> rule-based DB tip
- Disk cache persists across restarts (tip_cache.json)
- Category-aware prompting for correct hazardous/reusable guidance
- Multilingual-ready architecture (production: swap to Indic LLM)
- Model swap-ready via PERSON2_MODEL env var

## Data

- 4249+ curated waste items
- 4 categories: Recyclable / Biodegradable / Hazardous / Reusable
- Digital Twin log persists in material_flow.json
