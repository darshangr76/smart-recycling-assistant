import { WasteClassification, WasteCategory } from '../types';

export interface AIClassificationResponse {
  itemName: string;
  category: WasteCategory;
  confidence: number;
  recyclable: boolean;
  instructions: string[];
  disposalMethod: string;
  specialHandling: boolean;
  hazardLevel?: 'none' | 'low' | 'medium' | 'high';
  environmentalTip?: string;
}

export interface DemoPresetItem {
  id: string;
  name: string;
  category: WasteCategory;
  description: string;
  thumbnail: string;
  result: WasteClassification;
}

export const DEMO_PRESETS: DemoPresetItem[] = [
  {
    id: 'plastic-water-bottle',
    name: 'PET Water Bottle',
    category: 'Plastic',
    description: 'Clean clear plastic beverage container (#1 PET)',
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Polyethylene Terephthalate (PET #1) Bottle',
      category: 'Plastic',
      confidence: 0.96,
      recyclable: true,
      instructions: [
        'Empty any remaining liquid contents completely',
        'Lightly rinse with cold water if sticky',
        'Compress or crush bottle to save space in curbside bin',
        'Keep plastic cap on (most modern facilities accept caps attached)'
      ],
      disposalMethod: 'Curbside blue bin or local plastic recycling stream',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Empty liquid', 'Quick rinse', 'Replace cap'],
      commonMistakes: ['Throwing away half-full with liquids', 'Removing cap unless municipal guidelines mandate it'],
      environmentalTip: 'Recycling 1 ton of PET plastic saves ~1.5 tons of carbon emissions and 5,774 kWh of electricity.',
      estimatedWeightKg: 0.03,
      carbonAvoidedKg: 0.05,
      isDemo: true
    }
  },
  {
    id: 'aluminum-soda-can',
    name: 'Aluminum Beverage Can',
    category: 'Metal',
    description: 'Empty carbonated drink can (infinitely recyclable)',
    thumbnail: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Aluminum Soda / Seltzer Can',
      category: 'Metal',
      confidence: 0.98,
      recyclable: true,
      instructions: [
        'Empty liquid completely',
        'Rinse briefly to avoid attracting insects',
        'Do not crush if your local sorting plant uses optical sensors (otherwise crushing is fine)'
      ],
      disposalMethod: 'Curbside metal/dry recycling or deposit return scheme (DRS kiosk)',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Drain liquids', 'Rinse residues'],
      commonMistakes: ['Putting food cans with grease directly without rinsing'],
      environmentalTip: 'Aluminum can be recycled infinitely with zero degradation. It saves 95% of energy compared to raw bauxite extraction.',
      estimatedWeightKg: 0.015,
      carbonAvoidedKg: 0.14,
      isDemo: true
    }
  },
  {
    id: 'banana-peel',
    name: 'Organic Fruit Waste / Peel',
    category: 'Organic / compostable',
    description: 'Raw food scraps suitable for home or industrial compost',
    thumbnail: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Organic Fruit Scraps (Banana Peel)',
      category: 'Organic / compostable',
      confidence: 0.95,
      recyclable: true,
      instructions: [
        'Remove any plastic produce stickers or synthetic rubber bands',
        'Place into kitchen green caddy, backyard compost pile, or worm bin',
        'Avoid sealing in conventional non-biodegradable plastic bags'
      ],
      disposalMethod: 'Green organics bin, municipal compost, or home composting',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Peel sticker off', 'Collect in ventilated caddy'],
      commonMistakes: ['Leaving plastic fruit PLU stickers on peels', 'Disposing in landfill bag where it produces anaerobic methane'],
      environmentalTip: 'Diverting organic waste from landfills directly eliminates potent methane emissions (CH₄), which is 28x more potent than CO₂.',
      estimatedWeightKg: 0.12,
      carbonAvoidedKg: 0.08,
      isDemo: true
    }
  },
  {
    id: 'lithium-ion-battery',
    name: 'Lithium-ion Battery',
    category: 'Batteries',
    description: 'Rechargeable 18650 or phone battery cell (Fire risk in bins)',
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Lithium-Ion (Li-ion) Rechargeable Battery',
      category: 'Batteries',
      confidence: 0.94,
      recyclable: true,
      instructions: [
        'NEVER place in household curbside recycling or trash bins (Major fire hazard in collection trucks)',
        'Cover exposed metal terminals with non-conductive electrical or clear tape',
        'Store in a cool, dry place away from heat and metal keys',
        'Drop off at certified battery collection bins (Home Depot, Best Buy, or municipal e-waste center)'
      ],
      disposalMethod: 'Designated e-waste / battery drop-off facility only',
      specialHandling: true,
      hazardLevel: 'high',
      preparationSteps: ['Tape terminals with electrical tape', 'Store in non-metallic box', 'Drop at designated kiosk'],
      commonMistakes: ['Tossing in regular garbage (causes garbage truck fires)', 'Submerging in water'],
      environmentalTip: 'Battery recycling recovers high-purity cobalt, lithium, and nickel, reducing destructive open-pit mining.',
      estimatedWeightKg: 0.05,
      carbonAvoidedKg: 0.13,
      isDemo: true
    }
  },
  {
    id: 'pizza-box-greasy',
    name: 'Greasy Pizza Box',
    category: 'General or non-recyclable waste',
    description: 'Cardboard soaked in food oils and melted cheese',
    thumbnail: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Soiled / Greasy Pizza Box',
      category: 'General or non-recyclable waste',
      confidence: 0.89,
      recyclable: false,
      instructions: [
        'Tear off the clean, oil-free cardboard top lid and recycle with dry paper',
        'The greasy, cheese-stained bottom section cannot be recycled in paper mills because grease ruins paper pulp',
        'Tear greasy portion into small pieces for compost (if municipal composting allows food-soiled paper) or place in general waste'
      ],
      disposalMethod: 'Split item: Clean top to paper recycling; greasy bottom to compost or general waste',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Separate clean top lid from soiled base', 'Compost or bin greasy portion'],
      commonMistakes: ['Putting oily cardboard in clean paper stream, ruining entire batches of paper pulp'],
      environmentalTip: 'Even a small amount of oil contaminates water during the paper pulping process. Separating clean cardboard saves the salvageable material.',
      estimatedWeightKg: 0.25,
      carbonAvoidedKg: 0.02,
      isDemo: true
    }
  },
  {
    id: 'cardboard-box',
    name: 'Corrugated Shipping Box',
    category: 'Paper and cardboard',
    description: 'Brown cardboard box from delivery',
    thumbnail: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Corrugated Shipping / Delivery Box',
      category: 'Paper and cardboard',
      confidence: 0.97,
      recyclable: true,
      instructions: [
        'Remove any inner plastic bubble wrap or polystyrene foam peanuts',
        'Flatten the box completely to maximize bin volume and transport efficiency',
        'Clear plastic shipping tape is usually filtered out during industrial hydro-pulping, but peeling excess tape is helpful'
      ],
      disposalMethod: 'Curbside paper/cardboard bin or paper consolidation depot',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Remove plastic packing materials', 'Flatten completely'],
      commonMistakes: ['Leaving plastic air-pillows inside', 'Putting out wet cardboard in rain'],
      environmentalTip: 'Recycling cardboard uses 75% less energy than making virgin cardboard from timber, saving forest ecosystems.',
      estimatedWeightKg: 0.45,
      carbonAvoidedKg: 0.45,
      isDemo: true
    }
  },
  {
    id: 'smartphone-device',
    name: 'Broken Smartphone / E-Waste',
    category: 'Electronic waste',
    description: 'Old mobile phone with circuit board and glass screen',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'End-of-Life Smartphone / Handset',
      category: 'Electronic waste',
      confidence: 0.92,
      recyclable: true,
      instructions: [
        'Perform a factory reset and remove SIM/microSD cards to protect personal privacy',
        'Do not puncture or attempt to pry out swollen internal batteries',
        'Take to a certified electronics recycler (e-Stewards or R2 certified) or retailer trade-in'
      ],
      disposalMethod: 'E-waste drop-off center or electronics store recycling kiosk',
      specialHandling: true,
      hazardLevel: 'medium',
      preparationSteps: ['Wipe personal data', 'Remove case and SIM', 'Check for swollen battery'],
      commonMistakes: ['Discarding in curbside garbage where toxic lead and cadmium leach into soil'],
      environmentalTip: 'One metric ton of recycled smartphones yields more gold than 17 metric tons of gold ore mining.',
      estimatedWeightKg: 0.18,
      carbonAvoidedKg: 0.40,
      isDemo: true
    }
  },
  {
    id: 'tetrapak-carton',
    name: 'Tetra Pak Juice Carton',
    category: 'Paper and cardboard',
    description: 'Aseptic composite packaging with plastic spout (Multi-material)',
    thumbnail: 'https://images.unsplash.com/photo-1563630381190-77c473bb3795?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Aseptic Multi-Material Beverage Carton (Tetra Pak)',
      category: 'Paper and cardboard',
      confidence: 0.94,
      recyclable: true,
      instructions: [
        'Rinse out leftover juice/milk thoroughly to prevent odor and mold',
        'Remove plastic screw cap and place in plastic stream',
        'Flatten carton completely to minimize volume in collection truck',
        'Hydra-pulping mills recover the long virgin fibers for cardboard manufacturing'
      ],
      disposalMethod: 'Carton/beverage container recycling stream or curbside dry bin',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Rinse residue', 'Separate plastic spout/cap', 'Flatten carton'],
      commonMistakes: ['Leaving sticky liquid residue', 'Not removing separate plastic components'],
      environmentalTip: 'Tetra Pak is composite (75% paperboard, 20% polymer, 5% aluminum). Advanced mills separate fibers to make new paper products.',
      estimatedWeightKg: 0.045,
      carbonAvoidedKg: 0.07,
      isDemo: true
    }
  },
  {
    id: 'glass-jar',
    name: 'Glass Pasta Sauce Jar',
    category: 'Glass',
    description: 'Empty transparent glass food jar with metal lid',
    thumbnail: 'https://images.unsplash.com/photo-1594970471903-a52936a1a52a?auto=format&fit=crop&w=400&q=80',
    result: {
      itemName: 'Clear Food-Grade Glass Jar',
      category: 'Glass',
      confidence: 0.96,
      recyclable: true,
      instructions: [
        'Rinse thoroughly to remove sauce residue',
        'Separate metal twist-off lid (recycle metal lid separately or as accepted locally)',
        'Labels can remain attached as furnace heat burns them away'
      ],
      disposalMethod: 'Curbside glass recycling or neighborhood glass bottle bank',
      specialHandling: false,
      hazardLevel: 'none',
      preparationSteps: ['Rinse out sauce', 'Remove metal lid'],
      commonMistakes: ['Mixing heat-resistant Pyrex, drinking glasses, or window panes into bottle glass stream'],
      environmentalTip: 'Recycling glass cullet lowers furnace operating temperatures, saving energy and cutting emissions.',
      estimatedWeightKg: 0.32,
      carbonAvoidedKg: 0.10,
      isDemo: true
    }
  }
];

export class AIService {
  private static getApiBaseUrl(): string {
    // Priority 1: baked-in env URL (the tunnel URL — always wins)
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.trim()) return envUrl.trim();

    // Priority 2: user override from Settings UI
    const customUrl = localStorage.getItem('smart_recycle_custom_api');
    if (customUrl && customUrl.trim()) return customUrl.trim();

    // Priority 3: no backend configured (demo mode)
    return '';
  }

  /**
   * Validate image before sending
   */
  public static validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      return { valid: false, error: 'Unsupported format. Please upload JPEG, PNG, or WebP.' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size exceeds 10MB limit. Please choose a smaller photo.' };
    }

    return { valid: true };
  }

  public static async classifyWaste(
    imageFile: File,
    options?: { signal?: AbortSignal }
  ): Promise<{ data: WasteClassification; isLive: boolean; errorNotice?: string }> {
    const baseUrl = this.getApiBaseUrl();
    if (!baseUrl) {
      throw new Error('No AI backend configured. Set VITE_API_BASE_URL or localStorage.smart_recycle_custom_api.');
    }

    const image_b64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsDataURL(imageFile);
    });

    const endpoint = `${baseUrl.replace(/\/+$/, '')}/classify-image`;

    const timeout = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_b64 }),
        signal: options?.signal || controller.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        throw new Error(
          `classify HTTP ${response.status} at ${response.url} — ${bodyText.slice(0, 200)}`
        );
      }

      const json = await response.json();
      const validated = this.validateApiResponse(json);

      return {
        data: {
          ...validated,
          imageUrl: URL.createObjectURL(imageFile),
          timestamp: new Date().toISOString(),
          isDemo: false,
        },
        isLive: true,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
  private static validateApiResponse(data: any): WasteClassification {
    const validCategories: WasteCategory[] = [
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

    const category: WasteCategory = validCategories.includes(data.category)
      ? data.category
      : 'General or non-recyclable waste';

    return {
      itemName: String(data.itemName || 'Unidentified Item'),
      category,
      confidence: typeof data.confidence === 'number' ? Math.min(Math.max(data.confidence, 0), 1) : 0.85,
      recyclable: Boolean(data.recyclable),
      instructions: Array.isArray(data.instructions) && data.instructions.length > 0
        ? data.instructions
        : ['Follow local municipal waste guidelines'],
      disposalMethod: String(data.disposalMethod || 'Place in appropriate sorted bin'),
      specialHandling: Boolean(data.specialHandling),
      hazardLevel: data.hazardLevel || 'none',
      preparationSteps: Array.isArray(data.preparationSteps) ? data.preparationSteps : [],
      commonMistakes: Array.isArray(data.commonMistakes) ? data.commonMistakes : [],
      environmentalTip: data.environmentalTip || 'Every correctly sorted item prevents contamination in recycling streams.',
      estimatedWeightKg: typeof data.estimatedWeightKg === 'number' ? data.estimatedWeightKg : 0.1,
      carbonAvoidedKg: typeof data.carbonAvoidedKg === 'number' ? data.carbonAvoidedKg : 0.05
    };
  }

  /**
   * Deterministic & realistic classification simulator based on file name or random selection
   */
  public static async simulateClassification(file: File): Promise<WasteClassification> {
    // Artificial small delay for UX realism (700-1200ms)
    await new Promise((resolve) => setTimeout(resolve, 900));

    const fileNameLower = file.name.toLowerCase();

    // Check if filename matches preset keywords
    if (fileNameLower.includes('can') || fileNameLower.includes('coke') || fileNameLower.includes('tin') || fileNameLower.includes('metal')) {
      return { ...DEMO_PRESETS[1].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }
    if (fileNameLower.includes('banana') || fileNameLower.includes('apple') || fileNameLower.includes('food') || fileNameLower.includes('peel')) {
      return { ...DEMO_PRESETS[2].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }
    if (fileNameLower.includes('battery') || fileNameLower.includes('cell')) {
      return { ...DEMO_PRESETS[3].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }
    if (fileNameLower.includes('pizza') || fileNameLower.includes('grease')) {
      return { ...DEMO_PRESETS[4].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }
    if (fileNameLower.includes('box') || fileNameLower.includes('carton') || fileNameLower.includes('paper')) {
      return { ...DEMO_PRESETS[5].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }
    if (fileNameLower.includes('phone') || fileNameLower.includes('screen') || fileNameLower.includes('elec')) {
      return { ...DEMO_PRESETS[6].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }
    if (fileNameLower.includes('glass') || fileNameLower.includes('jar')) {
      return { ...DEMO_PRESETS[7].result, imageUrl: URL.createObjectURL(file), timestamp: new Date().toISOString() };
    }

    // Default to plastic bottle simulation with varying realistic confidence
    const base = DEMO_PRESETS[0].result;
    return {
      ...base,
      confidence: 0.91 + (Math.random() * 0.07),
      imageUrl: URL.createObjectURL(file),
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }
}
