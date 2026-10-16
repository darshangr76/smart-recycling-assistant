export type WasteCategory =
  | 'Plastic'
  | 'Paper and cardboard'
  | 'Glass'
  | 'Metal'
  | 'Organic / compostable'
  | 'Electronic waste'
  | 'Batteries'
  | 'General or non-recyclable waste'
  | 'Potentially hazardous waste';

export type HazardLevel = 'none' | 'low' | 'medium' | 'high';

export interface WasteClassification {
  id?: string;
  itemName: string;
  category: WasteCategory;
  confidence: number; // 0.0 - 1.0
  recyclable: boolean;
  instructions: string[];
  disposalMethod: string;
  specialHandling: boolean;
  hazardLevel?: HazardLevel;
  preparationSteps?: string[];
  commonMistakes?: string[];
  environmentalTip?: string;
  estimatedWeightKg?: number;
  carbonAvoidedKg?: number;
  timestamp?: string;
  imageUrl?: string;
  isDemo?: boolean;
  municipalityNote?: string;
}

export interface RecyclingGuideItem {
  id: string;
  name: string;
  category: WasteCategory;
  recyclable: boolean;
  iconName: string;
  summary: string;
  preparationSteps: string[];
  disposalMethod: string;
  commonMistakes: string[];
  specialHandlingWarning?: string;
  decompositionTime?: string;
  alternativeSuggestion?: string;
}

export interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  categoriesAccepted: WasteCategory[];
  phone?: string;
  website?: string;
  openingHours: string;
  isVerified: boolean;
  notes?: string;
  distanceKm?: number;
}

export interface ImpactMetrics {
  totalItemsScanned: number;
  totalDivertedKg: number;
  totalCo2SavedKg: number;
  recyclingAccuracyRate: number; // 0 - 100
  treesEquivalent: number;
  carMilesAvoided: number;
  waterSavedLiters: number;
  categoryTotals: Record<WasteCategory, number>;
  weeklyTrend: { day: string; items: number; weightKg: number }[];
  monthlyTrend: { month: string; weightKg: number; co2Kg: number }[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category?: WasteCategory;
  targetCount: number;
  currentCount: number;
  pointsReward: number;
  daysRemaining: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'weekly' | 'special';
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progressPercent: number;
}

export interface UserRewardProfile {
  points: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  lastActiveDate: string;
  claimedChallengeIds: string[];
  unlockedBadgeIds: string[];
}

export type ColorTheme =
  | 'neon-green'
  | 'emerald'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'lime'
  | 'cyan';

export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi
  | 'kn' // Kannada
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'ml' // Malayalam
  | 'mr' // Marathi
  | 'bn' // Bengali
  | 'gu' // Gujarati
  | 'pa'; // Punjabi

export interface UserSettings {
  municipality: string;
  unitSystem: 'metric' | 'imperial';
  enableSound: boolean;
  useDemoMode: boolean;
  customApiUrl: string;
  theme: 'light' | 'dark' | 'system';
  colorTheme: ColorTheme;
  language: LanguageCode;
  liveLocationEnabled: boolean;
  lastKnownCoords?: { lat: number; lng: number; city?: string };
}
