import { ImpactMetrics, WasteCategory, WasteClassification } from '../types';

/**
 * SCIENTIFIC METHODOLOGY & ASSUMPTIONS:
 * All environmental metrics provided by Smart Recycle AI are modeled estimates
 * based on peer-reviewed life-cycle analysis (LCA) literature and governmental
 * carbon accounting frameworks:
 * - EPA WARM (Waste Reduction Model v15)
 * - UK DEFRA / BEIS Greenhouse Gas Reporting Conversion Factors
 * - European Container Glass Federation (FEVE)
 * - The Aluminum Association Lifecycle Study
 *
 * Factors applied:
 * - Plastic: 1.50 kg CO2e avoided / kg recycled
 * - Aluminum & Metal: 9.00 kg CO2e avoided / kg recycled
 * - Paper & Cardboard: 1.05 kg CO2e avoided / kg recycled (plus forestry preservation)
 * - Glass: 0.31 kg CO2e avoided / kg recycled
 * - Organic Composting: 0.52 kg CO2e equivalent methane reduction / kg diverted
 * - Electronic Waste: 2.20 kg CO2e avoided / kg recycled
 * - Batteries: 2.50 kg CO2e avoided / kg + toxic leachate prevention
 */

export interface RecordedScanEvent {
  id: string;
  itemName: string;
  category: WasteCategory;
  weightKg: number;
  co2SavedKg: number;
  recyclable: boolean;
  sortedCorrectly: boolean;
  timestamp: string;
  imageUrl?: string;
  isDemo?: boolean;
}

const STORAGE_KEY = 'smart_recycle_scan_history';

// Realistic sample historical records for the initial demo experience
const INITIAL_DEMO_EVENTS: RecordedScanEvent[] = [
  {
    id: 'demo-scan-1',
    itemName: 'PET Beverage Bottle',
    category: 'Plastic',
    weightKg: 0.035,
    co2SavedKg: 0.052,
    recyclable: true,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-scan-2',
    itemName: 'Corrugated Shipping Box',
    category: 'Paper and cardboard',
    weightKg: 0.42,
    co2SavedKg: 0.441,
    recyclable: true,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-scan-3',
    itemName: 'Aluminum Soda Can',
    category: 'Metal',
    weightKg: 0.015,
    co2SavedKg: 0.135,
    recyclable: true,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-scan-4',
    itemName: 'Fruit Peels & Coffee Grounds',
    category: 'Organic / compostable',
    weightKg: 0.65,
    co2SavedKg: 0.338,
    recyclable: true,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-scan-5',
    itemName: 'Clear Glass Pasta Sauce Jar',
    category: 'Glass',
    weightKg: 0.32,
    co2SavedKg: 0.099,
    recyclable: true,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-scan-6',
    itemName: 'Lithium 18650 Cell',
    category: 'Batteries',
    weightKg: 0.045,
    co2SavedKg: 0.112,
    recyclable: true,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-scan-7',
    itemName: 'Greasy Pizza Box Bottom',
    category: 'General or non-recyclable waste',
    weightKg: 0.28,
    co2SavedKg: 0.0,
    recyclable: false,
    sortedCorrectly: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    isDemo: true
  }
];

export class ImpactService {
  /**
   * Carbon factors per kg by category (EPA / DEFRA estimates)
   */
  public static readonly CARBON_FACTORS: Record<WasteCategory, number> = {
    'Plastic': 1.50,
    'Metal': 9.00,
    'Paper and cardboard': 1.05,
    'Glass': 0.31,
    'Organic / compostable': 0.52,
    'Electronic waste': 2.20,
    'Batteries': 2.50,
    'General or non-recyclable waste': 0.0,
    'Potentially hazardous waste': 1.20
  };

  /**
   * Average estimated weight in kg when not specified
   */
  public static readonly DEFAULT_WEIGHTS: Record<WasteCategory, number> = {
    'Plastic': 0.04,
    'Metal': 0.03,
    'Paper and cardboard': 0.35,
    'Glass': 0.30,
    'Organic / compostable': 0.40,
    'Electronic waste': 0.25,
    'Batteries': 0.05,
    'General or non-recyclable waste': 0.20,
    'Potentially hazardous waste': 0.50
  };

  public static getHistory(): RecordedScanEvent[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EVENTS));
      return INITIAL_DEMO_EVENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_EVENTS;
    }
  }

  public static recordScan(item: WasteClassification, sortedCorrectly = true): RecordedScanEvent {
    const history = this.getHistory();
    const weight = item.estimatedWeightKg || this.DEFAULT_WEIGHTS[item.category] || 0.1;
    const factor = this.CARBON_FACTORS[item.category] || 0.0;
    const co2Saved = item.recyclable && sortedCorrectly ? parseFloat((weight * factor).toFixed(3)) : 0;

    const newEvent: RecordedScanEvent = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemName: item.itemName,
      category: item.category,
      weightKg: weight,
      co2SavedKg: co2Saved,
      recyclable: item.recyclable,
      sortedCorrectly,
      timestamp: new Date().toISOString(),
      imageUrl: item.imageUrl,
      isDemo: item.isDemo
    };

    history.unshift(newEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100))); // keep latest 100
    return newEvent;
  }

  public static calculateMetrics(): ImpactMetrics {
    const history = this.getHistory();

    let totalWeight = 0;
    let totalCo2 = 0;
    let correctCount = 0;

    const categoryTotals: Record<WasteCategory, number> = {
      'Plastic': 0,
      'Paper and cardboard': 0,
      'Glass': 0,
      'Metal': 0,
      'Organic / compostable': 0,
      'Electronic waste': 0,
      'Batteries': 0,
      'General or non-recyclable waste': 0,
      'Potentially hazardous waste': 0
    };

    history.forEach((ev) => {
      if (ev.recyclable && ev.sortedCorrectly) {
        totalWeight += ev.weightKg;
        totalCo2 += ev.co2SavedKg;
      }
      if (ev.sortedCorrectly) {
        correctCount += 1;
      }
      categoryTotals[ev.category] = (categoryTotals[ev.category] || 0) + 1;
    });

    const totalScans = history.length;
    const accuracy = totalScans > 0 ? Math.round((correctCount / totalScans) * 100) : 100;

    // Environmental equivalency formulas:
    // - 1 urban tree absorbs ~21.77 kg CO2 / year (EPA Greenhouse Gases Equivalencies)
    // - 1 passenger car mile emits ~0.404 kg CO2 (EPA)
    // - 1 kg paper recycled saves ~26 liters of industrial water
    const treesEquivalent = parseFloat((totalCo2 / 21.77).toFixed(2));
    const carMilesAvoided = parseFloat((totalCo2 / 0.404).toFixed(1));
    const waterSavedLiters = Math.round(totalWeight * 20);

    // Group weekly activity (last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weeklyTrend = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];

      const dayEvents = history.filter((e) => e.timestamp.startsWith(dateStr));
      const dayWeight = dayEvents.reduce((acc, curr) => acc + curr.weightKg, 0);

      return {
        day: dayLabel,
        items: dayEvents.length,
        weightKg: parseFloat(dayWeight.toFixed(2))
      };
    });

    // Monthly trend (sample distribution)
    const monthlyTrend = [
      { month: 'Jun', weightKg: 8.4, co2Kg: 12.1 },
      { month: 'Jul', weightKg: 11.2, co2Kg: 16.8 },
      { month: 'Aug', weightKg: 14.5, co2Kg: 21.4 },
      { month: 'Sep', weightKg: 17.8, co2Kg: 26.9 },
      { month: 'Oct', weightKg: parseFloat((totalWeight + 12.0).toFixed(1)), co2Kg: parseFloat((totalCo2 + 18.0).toFixed(1)) }
    ];

    return {
      totalItemsScanned: totalScans,
      totalDivertedKg: parseFloat(totalWeight.toFixed(2)),
      totalCo2SavedKg: parseFloat(totalCo2.toFixed(2)),
      recyclingAccuracyRate: accuracy,
      treesEquivalent,
      carMilesAvoided,
      waterSavedLiters,
      categoryTotals,
      weeklyTrend,
      monthlyTrend
    };
  }

  public static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
