"""Additional guideline chunks for RAG. Part 3 of 3."""

PART_3 = [
    {
        "id": "regional-05",
        "topic": "Recycling contamination",
        "text": "Contamination — food residue, liquids, plastic bags, greasy cardboard — is the top reason recycling loads get rejected. Rinse all containers. Keep recyclables dry. Never bag them in plastic. One contaminated item can send a whole truckload to landfill."
    },
    {
        "id": "regional-06",
        "topic": "Wishful recycling",
        "text": "Wishful recycling — putting items in the bin hoping they're recyclable — is worse than trashing them. It contaminates entire loads. When in doubt, throw it out. Check your local A-Z guide before placing unfamiliar items in recycling."
    },
    {
        "id": "regional-07",
        "topic": "Waste-to-energy facilities",
        "text": "Some municipalities burn non-recyclable waste in waste-to-energy (WTE) plants to generate electricity. Facilities accept items that curbside recycling rejects, including some plastics and contaminated paper. Check if your area has WTE before assuming an item goes to landfill."
    },
    {
        "id": "regional-08",
        "topic": "Composting ordinances",
        "text": "Some cities (San Francisco, Seattle, Portland) require food scrap separation by law. Others offer free compost bins. Check your municipal waste website for local rules. When in doubt, food scraps should be composted if facilities exist."
    },
    {
        "id": "special-01",
        "topic": "Smoke detectors",
        "text": "Ionization smoke detectors contain trace amounts of americium-241, a radioactive isotope. Return to manufacturer or take to HHW. Photoelectric detectors are safe for trash in most areas but still preferably recycled. Remove battery before disposal."
    },
    {
        "id": "special-02",
        "topic": "Fire extinguishers",
        "text": "Fire extinguishers are pressurized and must never go in trash. Return to retailer or take to HHW. Some fire departments refill and donate used ones. Empty, depressurized units may be accepted at scrap metal recyclers."
    },
    {
        "id": "special-03",
        "topic": "Propane tanks",
        "text": "1-lb propane cylinders are accepted at many hardware stores (Home Depot, Lowe's) for recycling. Larger tanks should be returned to suppliers or taken to HHW. Never place in trash — explosive risk. Empty tanks should still be treated as hazardous."
    },
    {
        "id": "special-04",
        "topic": "Paint disposal rules",
        "text": "Latex paint can be dried out with kitty litter, paint hardener, or shredded newspaper, then placed in trash once fully solid. Oil-based paint is hazardous and must go to HHW. Never pour paint down drains — it contaminates waterways and treatment plants."
    },
    {
        "id": "special-05",
        "topic": "Motor oil recycling",
        "text": "Used motor oil should be taken to auto parts stores (AutoZone, O'Reilly), service stations, or HHW facilities. One gallon of oil can contaminate one million gallons of drinking water. Never pour on ground, in storm drains, or in trash."
    },
    {
        "id": "special-06",
        "topic": "Medication take-back",
        "text": "The DEA sponsors National Prescription Drug Take-Back Days twice yearly (April and October). Many police stations have permanent drop boxes. Pharmacies (CVS, Walgreens) may provide mail-back envelopes. Never flush medication unless directed."
    },
    {
        "id": "special-07",
        "topic": "Ammunition and fireworks",
        "text": "Live ammunition, fireworks, and flares are explosive hazards. Contact local police or fire department for disposal. Never place in trash or recycling. Soak fireworks in water before disposal. Some areas sponsor special collection events."
    },
    {
        "id": "special-08",
        "topic": "Asbestos handling",
        "text": "Asbestos-containing materials (insulation, floor tiles, pipe wrap, roofing) require special disposal. Never break, cut, or sand them — fibers cause cancer. Hire a licensed asbestos abatement contractor for removal and disposal."
    },
    {
        "id": "special-09",
        "topic": "Medical sharps containers",
        "text": "Use an FDA-cleared sharps container or a sturdy plastic container with a screw-on lid (like a laundry detergent jug). Label it clearly. When full, seal and take to a pharmacy or HHW. Never place loose sharps in trash."
    },
    {
        "id": "special-10",
        "topic": "Fluorescent tube disposal",
        "text": "Fluorescent tubes contain mercury vapor. Take to hardware stores (Home Depot, Lowe's) or HHW. Handle carefully — if broken, ventilate the room, don't vacuum, use tape to pick up fragments, and dispose as hazardous waste."
    },
    {
        "id": "special-11",
        "topic": "Construction and demolition debris",
        "text": "C&D debris — drywall, lumber, concrete, asphalt shingles — should go to a C&D recycling facility, not curbside. Many materials are recyclable: clean wood, metal, concrete, and asphalt shingles. Treated wood is hazardous and must go to special disposal."
    },
    {
        "id": "special-12",
        "topic": "Yard waste ordinances",
        "text": "Many municipalities collect yard waste separately for composting. Grass, leaves, and branches should go in designated green bins, not trash. Never mix with household waste. Some areas ban yard waste from landfill entirely."
    },
]


if __name__ == "__main__":
    print(f"Part 3: {len(PART_3)} chunks loaded")
    for c in PART_3:
        print(f"  [{c['id']}] {c['topic']}")
