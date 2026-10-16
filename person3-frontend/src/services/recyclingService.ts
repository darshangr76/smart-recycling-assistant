import { RecyclingGuideItem, WasteCategory } from '../types';

export const RECYCLING_ITEMS: RecyclingGuideItem[] = [
  // Plastic
  {
    id: 'pet-bottle',
    name: 'Plastic Water / Soda Bottle (#1 PET)',
    category: 'Plastic',
    recyclable: true,
    iconName: 'Bottle',
    summary: 'Clear beverage bottles made from polyethylene terephthalate. Widely recycled globally.',
    preparationSteps: [
      'Empty all liquid contents completely',
      'Give a quick rinse with cold water',
      'Crush or compress bottle to save space',
      'Replace plastic cap securely onto bottle before recycling'
    ],
    disposalMethod: 'Curbside recycling blue bin or bottle deposit return kiosk',
    commonMistakes: [
      'Leaving half-full liquids that can spoil paper in commingled trucks',
      'Removing plastic bottle cap where modern facilities prefer caps attached'
    ],
    decompositionTime: '450 years in landfill',
    alternativeSuggestion: 'Reusable double-walled stainless steel water flask'
  },
  {
    id: 'hdpe-milk-jug',
    name: 'Milk Jug & Detergent Bottle (#2 HDPE)',
    category: 'Plastic',
    recyclable: true,
    iconName: 'Package',
    summary: 'High-density polyethylene bottles. High commercial value and easy to reprocess into plastic lumber.',
    preparationSteps: [
      'Rinse thoroughly to remove milky or soap residue',
      'Do not crush detergent bottles with corrosive residues unless clean',
      'Keep cap screwed on'
    ],
    disposalMethod: 'Curbside recycling container',
    commonMistakes: ['Not rinsing milk, causing odor and bacterial growth in sorting facility'],
    decompositionTime: '400 years',
    alternativeSuggestion: 'Refillable glass milk bottles or bulk detergent refill stations'
  },
  {
    id: 'plastic-grocery-bag',
    name: 'Plastic Grocery Bag / Film (#4 LDPE)',
    category: 'Plastic',
    recyclable: false,
    iconName: 'ShoppingBag',
    summary: 'Soft, stretchy plastic bags and cling film. CANNOT go in standard curbside bins.',
    preparationSteps: [
      'Do not put in home curbside bins—they tangle sorting machine rollers and shut down facilities',
      'Collect clean, dry bags together and return to grocery store drop-off bins'
    ],
    disposalMethod: 'Store take-back collection bin or reuse as trash liners',
    commonMistakes: ['Putting plastic bags in household curbside recycling bins', 'Bagging recyclables in trash bags'],
    specialHandlingWarning: 'Curbside Tangle Hazard: Plastic film wraps around rotating trommels, causing plant shutdowns.',
    decompositionTime: '500+ years',
    alternativeSuggestion: 'Durable organic cotton or canvas tote bags'
  },
  {
    id: 'yogurt-tub',
    name: 'Yogurt & Margarine Tub (#5 PP)',
    category: 'Plastic',
    recyclable: true,
    iconName: 'CupSoda',
    summary: 'Polypropylene food containers. Check local curbside acceptance for tubs.',
    preparationSteps: ['Scrape out food residue', 'Rinse with clean water', 'Discard aluminum foil peel-off lid'],
    disposalMethod: 'Curbside plastic bin (if municipality accepts #5 PP)',
    commonMistakes: ['Leaving foil seal attached to the rim', 'Throwing away unrinsed with rotting dairy'],
    decompositionTime: '20-30 years',
    alternativeSuggestion: 'Buy larger bulk containers rather than single-serve plastic cups'
  },

  // Paper & Cardboard
  {
    id: 'shipping-box',
    name: 'Corrugated Cardboard Box',
    category: 'Paper and cardboard',
    recyclable: true,
    iconName: 'Box',
    summary: 'Standard brown corrugated shipping boxes. Highly valuable fiber for recycling.',
    preparationSteps: [
      'Remove plastic packing air-pillows and bubble wrap',
      'Flatten all boxes flat to conserve truck volume',
      'Keep dry; do not leave outside in rainy weather'
    ],
    disposalMethod: 'Curbside paper/cardboard bin or paper depot',
    commonMistakes: ['Not flattening boxes, taking up 5x more truck volume', 'Recycling wet or moldy cardboard'],
    decompositionTime: '2 months (if composted)',
    alternativeSuggestion: 'Reuse sturdy delivery boxes for home storage or mailing'
  },
  {
    id: 'pizza-box',
    name: 'Pizza Box (Food-Soiled)',
    category: 'Paper and cardboard',
    recyclable: false,
    iconName: 'Pizza',
    summary: 'Food grease bonds to paper fibers and prevents proper pulp slurry separation.',
    preparationSteps: [
      'Inspect the box: tear off clean, unstained top lid for paper recycling',
      'The greasy cheese-stained bottom should be placed in compost (if accepted) or general trash'
    ],
    disposalMethod: 'Hybrid disposal: Clean parts to paper stream; greasy bottom to compost or general waste',
    commonMistakes: ['Throwing an entire grease-soaked box into recycling bin'],
    specialHandlingWarning: 'Oil Contamination: Even small traces of grease can ruin thousands of gallons of paper pulp.',
    decompositionTime: '2-3 months in industrial compost',
    alternativeSuggestion: 'Support pizzerias that use reusable pizza trays or compostable liners'
  },
  {
    id: 'coffee-cup',
    name: 'Disposable Coffee Paper Cup',
    category: 'General or non-recyclable waste',
    recyclable: false,
    iconName: 'Coffee',
    summary: 'Paper cups are lined with a tightly bonded polyethylene plastic waterproofing membrane.',
    preparationSteps: [
      'Remove plastic lid (often recyclable #5 PP or #6 PS depending on area)',
      'The cup itself goes into general waste unless specialized cup recycling kiosks exist'
    ],
    disposalMethod: 'General waste / Landfill bin',
    commonMistakes: ['Assuming paper cups can be recycled with regular newspapers or cardboard'],
    decompositionTime: '20-30 years',
    alternativeSuggestion: 'Bring your own thermal travel mug for coffee discounts'
  },
  {
    id: 'tetra-pak',
    name: 'Juice & Milk Carton (Tetra Pak / Aseptic)',
    category: 'Paper and cardboard',
    recyclable: true,
    iconName: 'Milk',
    summary: 'Multi-layer cartons consisting of 75% paperboard, 20% polyethylene, and 5% aluminum foil.',
    preparationSteps: [
      'Empty liquids completely',
      'Push straw inside or discard straw in trash',
      'Flatten carton flat and keep screw cap on'
    ],
    disposalMethod: 'Check local curbside carton stream or drop-off program',
    commonMistakes: ['Crushing without emptying contents', 'Assuming it goes in plastic instead of carton stream'],
    decompositionTime: '5 years',
    alternativeSuggestion: 'Fresh glass-bottled or bulk beverages'
  },

  // Glass
  {
    id: 'glass-bottle',
    name: 'Glass Beverage & Wine Bottle',
    category: 'Glass',
    recyclable: true,
    iconName: 'Wine',
    summary: 'Container glass is 100% recyclable indefinitely without loss in purity or quality.',
    preparationSteps: [
      'Empty and rinse out sediment',
      'Remove metal caps or corks (recycle metal caps with metal stream)',
      'Labels do not need to be removed'
    ],
    disposalMethod: 'Curbside glass bin or community glass bank',
    commonMistakes: ['Mixing with ceramics, lightbulbs, or window glass (different melting points)'],
    decompositionTime: '1,000,000+ years',
    alternativeSuggestion: 'Support wine and beer bottle refilling and deposit programs'
  },
  {
    id: 'pyrex-ceramic',
    name: 'Broken Pyrex Bakeware / Ceramic Mug',
    category: 'General or non-recyclable waste',
    recyclable: false,
    iconName: 'AlertTriangle',
    summary: 'Treated borosilicate glass and ceramic have very high melting temperatures that ruin bottle furnaces.',
    preparationSteps: [
      'Wrap broken shards securely in newspaper or cardboard to protect sanitation workers',
      'Never place into glass recycling containers'
    ],
    disposalMethod: 'General household waste / wrapped safely',
    commonMistakes: ['Mixing broken Pyrex bowls into bottle glass bins, causing entire batches of glass to be rejected'],
    specialHandlingWarning: 'Furnace Hazard: Borosilicate glass does not melt at container glass temperatures, creating inclusions.'
  },

  // Metal
  {
    id: 'aluminum-can',
    name: 'Aluminum Beverage Can',
    category: 'Metal',
    recyclable: true,
    iconName: 'Sparkles',
    summary: 'One of the most efficient recyclables. Recycling a can uses 95% less energy than mining bauxite.',
    preparationSteps: ['Empty liquid residue', 'Rinse lightly', 'Do not crush if your city uses optical sorting'],
    disposalMethod: 'Curbside recycling or bottle bill deposit kiosk',
    commonMistakes: ['Leaving cigarette butts or food items inside can'],
    decompositionTime: '80-100 years',
    alternativeSuggestion: 'Aluminum is great; prioritize returnable deposit schemes'
  },
  {
    id: 'steel-food-can',
    name: 'Steel / Tin Food Can (Soup, Beans, Tuna)',
    category: 'Metal',
    recyclable: true,
    iconName: 'Container',
    summary: 'Magnetic steel cans are easily sorted by electromagnets and recycled into auto parts and steel beams.',
    preparationSteps: [
      'Rinse out food residue',
      'Tuck sharp metal lid inside the can to avoid laceration risks'
    ],
    disposalMethod: 'Curbside metal/dry recycling',
    commonMistakes: ['Throwing away oily tuna cans without rinsing'],
    decompositionTime: '50 years',
    alternativeSuggestion: 'Dried bulk legumes cooked in an electric pressure cooker'
  },
  {
    id: 'aerosol-can',
    name: 'Aerosol Spray Can (Deodorant, Cooking Spray)',
    category: 'Metal',
    recyclable: true,
    iconName: 'Flame',
    summary: 'Steel or aluminum pressurized canisters. Can be recycled only when completely empty.',
    preparationSteps: [
      'Ensure the canister is 100% empty (no hissing when button pressed)',
      'Remove external plastic cap and recycle cap separately',
      'DO NOT puncture or crush pressurized cans'
    ],
    disposalMethod: 'Curbside metal recycling (if completely empty) or household hazardous waste',
    commonMistakes: ['Disposing partially full cans (risk of explosion in compaction trucks)'],
    specialHandlingWarning: 'Explosion Risk: Pressurized cans with residual gas can explode inside recycling compactor trucks.'
  },

  // Organic / Compostable
  {
    id: 'fruit-veg-scraps',
    name: 'Vegetable & Fruit Peels / Coffee Grounds',
    category: 'Organic / compostable',
    recyclable: true,
    iconName: 'Apple',
    summary: 'Nutrient-rich organic biomass that transforms into nutrient-dense compost soil amendment.',
    preparationSteps: [
      'Remove all plastic PLU fruit stickers and rubber bands',
      'Collect in a breathable kitchen food scrap bin',
      'Do not use conventional non-certified plastic liner bags'
    ],
    disposalMethod: 'Green organics curbside bin, home compost pile, or bokashi fermenter',
    commonMistakes: ['Putting plastic stickers or plastic tea bags in compost', 'Allowing scraps to rot anaerobically in trash'],
    decompositionTime: '2-6 weeks in proper aerobic compost',
    alternativeSuggestion: 'Use vegetable trimmings to brew homemade vegetable broth before composting'
  },
  {
    id: 'meat-dairy-scraps',
    name: 'Cooked Meat, Bones & Dairy',
    category: 'Organic / compostable',
    recyclable: true,
    iconName: 'Drumstick',
    summary: 'Acceptable in municipal industrial aerobic composting, but typically avoided in basic backyard home piles.',
    preparationSteps: [
      'Check if your municipality has industrial high-heat composting (which easily breaks down pathogens)',
      'If using home backyard compost, avoid meat unless using an in-ground digester or bokashi system'
    ],
    disposalMethod: 'Municipal organic green bin (check city rules)',
    commonMistakes: ['Attracting rodents in open backyard piles'],
    decompositionTime: '1-3 months in commercial composting'
  },

  // Electronic Waste
  {
    id: 'smartphone-device',
    name: 'Old Smartphone / Tablet / Laptop',
    category: 'Electronic waste',
    recyclable: true,
    iconName: 'Smartphone',
    summary: 'Contains precious metals (gold, copper, silver) and rare earth elements, alongside toxic heavy metals.',
    preparationSteps: [
      'Perform complete device factory reset and sign out of Apple ID / Google account',
      'Remove SIM card and memory card',
      'Inspect for battery swelling (thick pillow-like bulge)'
    ],
    disposalMethod: 'Dedicated e-waste collection center, electronic retailer trade-in (Best Buy, Apple Store)',
    commonMistakes: ['Throwing in curbside trash where toxic lead and mercury can leach into groundwater'],
    specialHandlingWarning: 'Hazardous Components: Circuit boards and batteries contain toxic heavy metals and require e-Stewards certified dismantling.'
  },
  {
    id: 'charging-cable',
    name: 'Charging Cables, Wires & Power Adapters',
    category: 'Electronic waste',
    recyclable: true,
    iconName: 'Cable',
    summary: 'High-purity copper core coated in PVC insulation. Highly sought after by specialized scrap recyclers.',
    preparationSteps: [
      'Bundle cables neatly with a twist tie or rubber band',
      'Keep away from standard curbside recycling bins (they wrap around conveyor belts)'
    ],
    disposalMethod: 'E-waste drop-off bin or scrap metal recycler',
    commonMistakes: ['Throwing in household recycling bin as "tanglers"']
  },

  // Batteries
  {
    id: 'li-ion-battery',
    name: 'Lithium-Ion Rechargeable Battery',
    category: 'Batteries',
    recyclable: true,
    iconName: 'BatteryCharging',
    summary: 'High-density energy storage used in laptops, power banks, vape pens, and electric tools.',
    preparationSteps: [
      'NEVER put in home trash or curbside recycling bins',
      'Cover positive and negative terminals with non-conductive electrical tape or scotch tape',
      'Place in individual plastic bags to prevent thermal short circuits'
    ],
    disposalMethod: 'Call2Recycle drop-off kiosk (at hardware stores, supermarkets) or municipal toxic facility',
    commonMistakes: ['Crushing or disposing in regular trash—a leading cause of garbage truck and landfill fires!'],
    specialHandlingWarning: 'FIRE HAZARD: Thermal runaway can occur if punctured or shorted. Always tape exposed terminals.'
  },
  {
    id: 'alkaline-battery',
    name: 'Alkaline AA / AAA / 9V Battery',
    category: 'Batteries',
    recyclable: true,
    iconName: 'Battery',
    summary: 'Common household single-use zinc-manganese batteries.',
    preparationSteps: [
      'Tape 9V battery terminals (the dual snap posts) to prevent electrical fires',
      'Collect in a dry plastic box before community drop-off'
    ],
    disposalMethod: 'Battery recycling drop-off box; some cities allow trash disposal, but recycling is highly recommended to recover steel and zinc',
    commonMistakes: ['Throwing multiple 9V batteries in a bag together without taped terminals (leads to sparks)']
  },

  // Potentially Hazardous Waste
  {
    id: 'cfl-lightbulb',
    name: 'Compact Fluorescent Lamp (CFL) / Tube',
    category: 'Potentially hazardous waste',
    recyclable: true,
    iconName: 'Lightbulb',
    summary: 'Contains small amounts of toxic mercury vapor. Illegal to throw in regular trash in many jurisdictions.',
    preparationSteps: [
      'Handle gently by the plastic base to avoid breaking glass',
      'If broken, ventilate the room for 15 minutes and wipe with damp paper towel (do not vacuum)',
      'Place in sealed cardboard box or bag'
    ],
    disposalMethod: 'Household Hazardous Waste (HHW) facility or hardware store drop-off (Home Depot, IKEA)',
    commonMistakes: ['Vacuuming broken CFL bulbs, which vaporizes mercury throughout the room'],
    specialHandlingWarning: 'Toxic Mercury Hazard: Inhalation of mercury vapors causes neurological toxicity.'
  },
  {
    id: 'oil-paint-can',
    name: 'Oil-Based Paint, Stain & Solvents',
    category: 'Potentially hazardous waste',
    recyclable: false,
    iconName: 'Paintbrush',
    summary: 'Flammable chemical compounds, volatile organic chemicals (VOCs), and petroleum distillates.',
    preparationSteps: [
      'Keep in original container with readable warning label',
      'Ensure lid is sealed tightly to prevent evaporation or spills',
      'Do not pour down sinks, storm drains, or into toilets'
    ],
    disposalMethod: 'Municipal Household Hazardous Waste (HHW) drop-off depot or paint recycling program (PaintCare)',
    commonMistakes: ['Pouring solvents down sink drains, poisoning aquatic life and damaging sewer plumbing'],
    specialHandlingWarning: 'Environmental Hazard: Never dispose down drains or storm sewers.'
  }
];

export class RecyclingService {
  public static getAllItems(): RecyclingGuideItem[] {
    return RECYCLING_ITEMS;
  }

  public static searchItems(query: string, categoryFilter?: WasteCategory | 'All', recyclableFilter?: boolean | 'All'): RecyclingGuideItem[] {
    const q = query.trim().toLowerCase();

    return RECYCLING_ITEMS.filter((item) => {
      const matchesCategory =
        !categoryFilter || categoryFilter === 'All' || item.category === categoryFilter;

      const matchesRecyclable =
        recyclableFilter === undefined || recyclableFilter === 'All' || item.recyclable === recyclableFilter;

      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.disposalMethod.toLowerCase().includes(q) ||
        item.preparationSteps.some((step) => step.toLowerCase().includes(q)) ||
        item.commonMistakes.some((m) => m.toLowerCase().includes(q));

      return matchesCategory && matchesRecyclable && matchesQuery;
    });
  }

  public static getItemById(id: string): RecyclingGuideItem | undefined {
    return RECYCLING_ITEMS.find((item) => item.id === id);
  }

  public static getCategories(): WasteCategory[] {
    return [
      'Plastic',
      'Paper and cardboard',
      'Glass',
      'Metal',
      'Organic / compostable',
      'Electronic waste',
      'Batteries',
      'General or non-recyclable waste',
      'Potentially hazardous waste'
    ];
  }
}
