"""
Curated recycling / disposal guideline corpus for RAG.
Each chunk is a short passage an LLM can cite.
Modeled on EPA, municipal, and manufacturer guidance (paraphrased).
"""

GUIDELINES = [
    # ── GENERAL ────────────────────────────────────────────
    {
        "id": "general-01",
        "topic": "Reduce, Reuse, Recycle hierarchy",
        "text": "The waste hierarchy prioritizes reduction first, then reuse, then recycling, then recovery, and finally disposal. Reusing an item always beats recycling it, because recycling itself consumes energy and water. When in doubt, ask whether the item can be donated, repaired, or repurposed before placing it in a recycling bin."
    },
    {
        "id": "general-02",
        "topic": "Single-stream recycling contamination",
        "text": "Contamination is the top reason recycling loads get rejected. Food residue, liquids, plastic bags, and greasy cardboard ruin entire batches. Always rinse containers, keep recyclables dry, and never bag your recyclables inside plastic bags unless your municipality explicitly allows it."
    },
    {
        "id": "general-03",
        "topic": "When in doubt, throw it out",
        "text": "The single biggest cause of recycling failures is wishful recycling. If you are not sure whether an item is recyclable, place it in the trash rather than the recycling bin. One wrong item can contaminate an entire truckload, so accuracy matters more than enthusiasm."
    },

    # ── PLASTICS ───────────────────────────────────────────
    {
        "id": "plastic-01",
        "topic": "Plastic resin codes 1-7",
        "text": "Plastics are labeled with resin codes 1 through 7 inside a triangle. Codes 1 (PET) and 2 (HDPE) are the most widely recycled. Codes 3 (PVC), 6 (PS), and 7 (other) are rarely accepted in curbside programs. Always check your local program before placing plastics in the recycling bin."
    },
    {
        "id": "plastic-02",
        "topic": "Plastic bags and film",
        "text": "Plastic bags and film do not belong in curbside recycling — they tangle sorting machinery. Many grocery stores and retailers offer drop-off bins for clean, dry plastic film, including bags, wraps, and bubble mailers. Never place plastic bags in your home recycling bin."
    },
    {
        "id": "plastic-03",
        "topic": "Rigid plastic containers",
        "text": "Rigid plastic containers like bottles, jugs, and tubs are typically recyclable if rinsed. Remove caps and pumps unless your program says otherwise. Lids smaller than a credit card often fall through sorting screens and should be placed in the trash or left attached to their container if local guidance allows."
    },
    {
        "id": "plastic-04",
        "topic": "Black plastic",
        "text": "Black plastic is rarely recycled because optical sorting equipment cannot detect carbon-black pigments. Even if labeled #1 or #2, black plastic trays and containers usually end up in landfill. Prefer clear or white plastic when purchasing, and place black plastic in the trash."
    },

    # ── GLASS ──────────────────────────────────────────────
    {
        "id": "glass-01",
        "topic": "Glass bottles and jars",
        "text": "Glass bottles and jars are infinitely recyclable without quality loss. Rinse them and remove lids. Metal lids go with metals; plastic lids go in the trash. Never mix in drinking glasses, mirrors, or window glass — they have different melting points and contaminate the batch."
    },
    {
        "id": "glass-02",
        "topic": "Broken glass",
        "text": "Broken glass should never go loose in the recycling bin — it endangers workers. Wrap it in newspaper or place it in a cardboard box labeled 'broken glass' and put it in the trash. Some municipalities have dedicated drop-off for glass shards."
    },
    {
        "id": "glass-03",
        "topic": "Ceramics and Pyrex",
        "text": "Ceramics, Pyrex, and heat-resistant glass are not recyclable with container glass. They melt at different temperatures and cause structural weaknesses in new glass products. Donate intact pieces, or wrap and trash broken ones."
    },

    # ── METALS ─────────────────────────────────────────────
    {
        "id": "metal-01",
        "topic": "Aluminum cans",
        "text": "Aluminum cans are one of the highest-value recyclables — an aluminum can can be back on the shelf within 60 days. Rinse, crush lightly if you have space, and place in the recycling bin. Do not flatten so completely that sorting equipment cannot identify them."
    },
    {
        "id": "metal-02",
        "topic": "Steel and tin cans",
        "text": "Steel and tin cans from food are magnetic and easily sorted at recycling facilities. Rinse them, remove labels if easy, and place in the recycling bin. Sharp edges should be pushed inward to prevent cuts to workers."
    },
    {
        "id": "metal-03",
        "topic": "Aerosol cans",
        "text": "Empty aerosol cans may be recyclable in some areas, but many programs reject them due to residual pressure and flammability. If the can still has product inside, treat it as household hazardous waste. Never puncture or crush aerosol cans."
    },

    # ── PAPER ──────────────────────────────────────────────
    {
        "id": "paper-01",
        "topic": "Cardboard",
        "text": "Cardboard is highly recyclable as long as it is clean and dry. Flatten boxes to save space. Remove tape, plastic windows, and packing materials. Greasy or wet cardboard — such as pizza boxes with cheese residue — should be composted or trashed instead."
    },
    {
        "id": "paper-02",
        "topic": "Shredded paper",
        "text": "Shredded paper is difficult to recycle because the small pieces fall through sorting screens and blow out of trucks. Place shredded paper in a paper bag or cardboard box before recycling. Never place it loose in the bin."
    },
    {
        "id": "paper-03",
        "topic": "Paper towels and tissues",
        "text": "Paper towels and tissues are not recyclable because their fibers are too short after one use, and they are often contaminated. Clean paper towels can be composted; greasy or chemically soiled ones should go in the trash."
    },
    {
        "id": "paper-04",
        "topic": "Glossy and coated paper",
        "text": "Magazines, catalogs, and glossy flyers are generally recyclable despite their shiny coating. Remove any plastic wrapping or sample inserts first. Shredded glossy paper is harder to recycle — prefer keeping it flat."
    },

    # ── ORGANICS / COMPOST ─────────────────────────────────
    {
        "id": "organic-01",
        "topic": "Composting basics",
        "text": "Composting needs a balance of greens (nitrogen-rich: fruit, vegetables, coffee grounds, grass) and browns (carbon-rich: leaves, cardboard, paper). A 1:2 ratio of greens to browns by volume keeps the pile from smelling. Turn the pile weekly and keep it moist like a wrung-out sponge."
    },
    {
        "id": "organic-02",
        "topic": "What not to compost",
        "text": "Do not compost meat, dairy, oils, or pet waste in a home bin — they attract pests and produce odors. Diseased plants should be trashed because home compost does not get hot enough to kill pathogens. Citrus peels are fine in moderation but slow down worm bins."
    },
    {
        "id": "organic-03",
        "topic": "Coffee grounds and filters",
        "text": "Coffee grounds are a nitrogen-rich compost ingredient and can be applied directly to garden soil as a slow-release fertilizer. Paper coffee filters can be composted along with the grounds. Plastic or mesh tea bags should be emptied and the mesh trashed."
    },
    {
        "id": "organic-04",
        "topic": "Yard waste",
        "text": "Yard waste — leaves, grass clippings, brush — is collected separately in many municipalities for municipal composting. Never mix yard waste with household trash. Grass clippings can be left on the lawn as mulch to return nutrients to the soil."
    },

    # ── HAZARDOUS ──────────────────────────────────────────
    {
        "id": "haz-01",
        "topic": "Household hazardous waste overview",
        "text": "Household hazardous waste includes paints, solvents, pesticides, batteries, fluorescent bulbs, and e-waste. These items should never go in regular trash or down the drain. Most municipalities host periodic HHW collection days or have permanent drop-off centers. Check your city's public works website."
    },
    {
        "id": "haz-02",
        "topic": "Battery disposal",
        "text": "Batteries contain heavy metals and reactive chemicals. Lithium batteries can cause fires if crushed or punctured — tape the terminals with clear tape before drop-off. Never place any battery in regular trash or curbside recycling. Use retail battery drop-off bins or your local HHW facility."
    },
    {
        "id": "haz-03",
        "topic": "Paint disposal",
        "text": "Oil-based paints are hazardous waste and must go to an HHW facility. Latex (water-based) paint can be dried out with kitty litter or paint hardener and placed in the trash once fully solid. Never pour paint down a drain or storm sewer — it contaminates waterways."
    },
    {
        "id": "haz-04",
        "topic": "Fluorescent bulb disposal",
        "text": "Fluorescent bulbs — including CFLs — contain mercury and must be recycled at a hardware store or HHW facility. Do not throw them in the trash. If one breaks, ventilate the room, do not vacuum, and use tape to pick up fragments."
    },
    {
        "id": "haz-05",
        "topic": "E-waste disposal",
        "text": "Electronic waste contains heavy metals, flame retardants, and recoverable precious metals. Never place electronics in the trash. Use manufacturer take-back programs, municipal e-waste drop-off, or certified recyclers such as R2 or e-Stewards facilities."
    },
    {
        "id": "haz-06",
        "topic": "Medication disposal",
        "text": "Do not flush medication unless the label directs you to. Flushing contaminates waterways and can harm aquatic life. Use drug take-back programs at pharmacies or police stations. If no program is available, mix pills with kitty litter or coffee grounds, seal in a bag, and place in the trash."
    },
    {
        "id": "haz-07",
        "topic": "Motor oil and automotive fluids",
        "text": "Motor oil, brake fluid, antifreeze, and transmission fluid are hazardous. One quart of oil can contaminate one million gallons of drinking water. Take these to an auto parts store, service station, or HHW facility. Never pour them on the ground or into storm drains."
    },
    {
        "id": "haz-08",
        "topic": "Sharps disposal",
        "text": "Needles, lancets, and syringes must go in a puncture-resistant sharps container, never in regular trash or recycling. Many pharmacies accept full sharps containers for disposal. Some municipalities allow sealed sharps containers in the trash if labeled clearly — check local rules."
    },

    # ── REUSE ──────────────────────────────────────────────
    {
        "id": "reuse-01",
        "topic": "Textile donation",
        "text": "Clothing, shoes, and household textiles should be donated if wearable and clean. Even worn textiles can often be recycled into insulation, rags, or industrial wipes — most donation centers accept them. Never place textiles in curbside recycling bins; they tangle sorting equipment."
    },
    {
        "id": "reuse-02",
        "topic": "Furniture donation",
        "text": "Furniture in good condition can be donated to charities such as Goodwill, Salvation Army, or local shelters. Many will pick up large items for free. Broken or stained furniture can often be disassembled and the wood or metal recycled separately."
    },
    {
        "id": "reuse-03",
        "topic": "Book donation",
        "text": "Books can be donated to libraries, schools, thrift stores, or Little Free Libraries. Books in poor condition can have their covers removed and the pages recycled as paper. Encyclopedias and textbooks are often refused by donation centers due to outdated content."
    },
    {
        "id": "reuse-04",
        "topic": "Repair before replacing",
        "text": "Many items considered disposable — small appliances, electronics, clothing, and furniture — can be repaired. Repair cafés, makerspaces, and manufacturer programs exist for common items. Repairing once saves the energy and resources of manufacturing a replacement."
    },

    # ── REGIONAL NOTES ─────────────────────────────────────
    {
        "id": "regional-01",
        "topic": "Local rules vary",
        "text": "Recycling rules vary significantly between municipalities. An item accepted curbside in one city may be banned in the next. Always check your city or county waste authority's website for the authoritative list. When in doubt, look up the item by name in your local A-Z disposal guide."
    },
    {
        "id": "regional-02",
        "topic": "Deposit / bottle bill programs",
        "text": "Ten US states and many countries have deposit programs for beverage containers. Containers with a deposit value should be returned to a retailer or redemption center rather than placed in curbside recycling — you get the deposit back and the material is high-quality."
    },
]


def get_all() -> list:
    return GUIDELINES


def count() -> int:
    return len(GUIDELINES)




# ─── MERGE EXTENDED CHUNKS ─────────────────────────────────
try:
    from rag_docs_extra import PART_1
    from rag_docs_extra_2 import PART_2
    from rag_docs_extra_3 import PART_3
    _EXISTING_IDS = {g["id"] for g in GUIDELINES}
    for _c in PART_1 + PART_2 + PART_3:
        if _c["id"] not in _EXISTING_IDS:
            GUIDELINES.append(_c)
except ImportError as e:
    print(f"Note: extended chunks not loaded: {e}")



# ─── EWaste additions ───
_EWASTE_RAG = [
    {
        "id": "ewaste-11",
        "topic": "AirPods and wireless earbuds",
        "text": "AirPods, wireless earbuds, and true-wireless headphones contain lithium-ion batteries in both the buds and the charging case. They must never go in regular trash or curbside recycling. Take them to an e-waste drop-off (Best Buy, Staples, or your municipality's HHW facility). Wipe/erase before disposal.",
    },
    {
        "id": "ewaste-12",
        "topic": "Headphones and audio devices",
        "text": "Wired and Bluetooth headphones contain copper wiring, small circuit boards, and often lithium batteries. Take them to an e-waste recycler or manufacturer take-back program. Donate functional pairs to thrift stores or schools. Never place in regular trash.",
    },
    {
        "id": "ewaste-13",
        "topic": "Power banks and portable chargers",
        "text": "Power banks contain lithium-ion cells that can cause fires if punctured. Tape the terminals with clear tape, place each in a separate bag, and take to an e-waste or battery drop-off. Never place in curbside recycling or trash.",
    },
    {
        "id": "ewaste-14",
        "topic": "Small electronics and accessories",
        "text": "Small electronics like smartwatches, fitness trackers, wireless chargers, keyboards, and mice contain recoverable metals and often lithium batteries. Take to e-waste drop-off or manufacturer take-back. Wipe data first if the device has storage.",
    },
]
for _c in _EWASTE_RAG:
    if not any(g['id'] == _c['id'] for g in GUIDELINES):
        GUIDELINES.append(_c)
del _EWASTE_RAG

if __name__ == "__main__":
    print(f"Loaded {count()} guideline chunks:")
    for g in GUIDELINES:
        print(f"  [{g['id']}] {g['topic']}")
