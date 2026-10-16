import { Badge, Challenge, UserRewardProfile } from '../types';
import confetti from 'canvas-confetti';

const REWARDS_STORAGE_KEY = 'smart_recycle_rewards_profile';
const CLAIMED_EVENTS_KEY = 'smart_recycle_claimed_event_ids';

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first-scan',
    name: 'Eco Initiate',
    description: 'Scanned your very first waste item with AI',
    icon: 'Sparkles',
    category: 'Milestones',
    isUnlocked: true,
    progressPercent: 100,
    unlockedAt: '2026-10-10'
  },
  {
    id: 'plastic-hero',
    name: 'Polymer Crusher',
    description: 'Diverted 5 or more plastic bottles from landfills',
    icon: 'ShieldCheck',
    category: 'Materials',
    isUnlocked: true,
    progressPercent: 100,
    unlockedAt: '2026-10-12'
  },
  {
    id: 'battery-guardian',
    name: 'Battery Guardian',
    description: 'Properly routed hazardous batteries to certified drop-off kiosks',
    icon: 'Zap',
    category: 'Hazardous',
    isUnlocked: false,
    progressPercent: 60
  },
  {
    id: 'e-waste-champion',
    name: 'Silicon Savior',
    description: 'Recycled old electronics or broken cables safely',
    icon: 'Cpu',
    category: 'Electronics',
    isUnlocked: false,
    progressPercent: 40
  },
  {
    id: 'master-composter',
    name: 'Soil Alchemist',
    description: 'Diverted 10 kg of organic kitchen scraps into compost',
    icon: 'Leaf',
    category: 'Organics',
    isUnlocked: false,
    progressPercent: 75
  },
  {
    id: 'streak-master',
    name: 'Consistency Champion',
    description: 'Maintained a 7-day sustainable recycling streak',
    icon: 'Flame',
    category: 'Streak',
    isUnlocked: true,
    progressPercent: 100,
    unlockedAt: '2026-10-14'
  }
];

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'ch-daily-scan',
    title: 'Daily Sorter',
    description: 'Scan and properly dispose of at least 2 items today',
    targetCount: 2,
    currentCount: 2,
    pointsReward: 30,
    daysRemaining: 1,
    completed: true,
    claimed: false,
    type: 'daily',
    icon: 'CheckCircle2'
  },
  {
    id: 'ch-plastic-rinse',
    title: 'Clean Stream Pledge',
    description: 'Rinse and sort 3 beverage containers (#1 PET or #2 HDPE)',
    category: 'Plastic',
    targetCount: 3,
    currentCount: 2,
    pointsReward: 50,
    daysRemaining: 3,
    completed: false,
    claimed: false,
    type: 'weekly',
    icon: 'Droplets'
  },
  {
    id: 'ch-guide-explorer',
    title: 'Knowledge is Power',
    description: 'Read disposal rules for 3 items in the Recycling Guide',
    targetCount: 3,
    currentCount: 3,
    pointsReward: 25,
    daysRemaining: 4,
    completed: true,
    claimed: false,
    type: 'weekly',
    icon: 'BookOpen'
  },
  {
    id: 'ch-dropoff-visit',
    title: 'Hazardous Drop-off Hero',
    description: 'Locate a nearby battery or e-waste recycling center',
    targetCount: 1,
    currentCount: 0,
    pointsReward: 75,
    daysRemaining: 6,
    completed: false,
    claimed: false,
    type: 'special',
    icon: 'MapPin'
  }
];

export class RewardService {
  public static readonly POINTS_PER_SCAN = 15;
  public static readonly POINTS_PER_CONFIRMED_SORT = 20;
  public static readonly POINTS_PER_GUIDE_READ = 5;

  public static getProfile(): UserRewardProfile {
    const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) {
      const defaultProfile: UserRewardProfile = {
        points: 420,
        level: 3,
        levelTitle: 'Eco Advocate',
        streakDays: 5,
        lastActiveDate: new Date().toISOString(),
        claimedChallengeIds: [],
        unlockedBadgeIds: ['first-scan', 'plastic-hero', 'streak-master']
      };
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        points: 0,
        level: 1,
        levelTitle: 'Eco Seed',
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
        claimedChallengeIds: [],
        unlockedBadgeIds: []
      };
    }
  }

  public static saveProfile(profile: UserRewardProfile): void {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(profile));
  }

  public static getChallenges(): Challenge[] {
    const profile = this.getProfile();
    return DEFAULT_CHALLENGES.map((ch) => ({
      ...ch,
      claimed: profile.claimedChallengeIds.includes(ch.id)
    }));
  }

  public static getBadges(): Badge[] {
    const profile = this.getProfile();
    return DEFAULT_BADGES.map((b) => ({
      ...b,
      isUnlocked: profile.unlockedBadgeIds.includes(b.id)
    }));
  }

  /**
   * Award points for an event, preventing duplicate awards for the same event ID
   */
  public static awardPointsForEvent(eventId: string, points: number, reason: string): { awarded: boolean; newTotal: number } {
    const rawClaimed = localStorage.getItem(CLAIMED_EVENTS_KEY);
    const claimedSet: string[] = rawClaimed ? JSON.parse(rawClaimed) : [];

    if (claimedSet.includes(eventId)) {
      return { awarded: false, newTotal: this.getProfile().points };
    }

    claimedSet.push(eventId);
    localStorage.setItem(CLAIMED_EVENTS_KEY, JSON.stringify(claimedSet));

    const profile = this.getProfile();
    profile.points += points;

    // Recalculate level
    const newLevel = Math.floor(profile.points / 150) + 1;
    profile.level = newLevel;

    if (newLevel <= 1) profile.levelTitle = 'Eco Seed';
    else if (newLevel === 2) profile.levelTitle = 'Green Sprout';
    else if (newLevel === 3) profile.levelTitle = 'Eco Advocate';
    else if (newLevel === 4) profile.levelTitle = 'Earth Guardian';
    else profile.levelTitle = 'Zero-Waste Champion';

    this.saveProfile(profile);

    return { awarded: true, newTotal: profile.points };
  }

  /**
   * Directly award points for special actions like rinsing container (+10 pts)
   */
  public static awardDirectPoints(points: number, reason: string): { newTotal: number } {
    const profile = this.getProfile();
    profile.points += points;

    const newLevel = Math.floor(profile.points / 150) + 1;
    profile.level = newLevel;

    if (newLevel <= 1) profile.levelTitle = 'Eco Seed';
    else if (newLevel === 2) profile.levelTitle = 'Green Sprout';
    else if (newLevel === 3) profile.levelTitle = 'Eco Advocate';
    else if (newLevel === 4) profile.levelTitle = 'Earth Guardian';
    else profile.levelTitle = 'Zero-Waste Champion';

    this.saveProfile(profile);
    return { newTotal: profile.points };
  }

  public static claimChallenge(challengeId: string): { success: boolean; pointsAwarded: number } {
    const challenges = this.getChallenges();
    const target = challenges.find((c) => c.id === challengeId);
    if (!target || !target.completed || target.claimed) {
      return { success: false, pointsAwarded: 0 };
    }

    const profile = this.getProfile();
    profile.claimedChallengeIds.push(challengeId);
    profile.points += target.pointsReward;
    this.saveProfile(profile);

    // Fire celebratory confetti
    this.fireConfetti();

    return { success: true, pointsAwarded: target.pointsReward };
  }

  public static fireConfetti(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#84cc16', '#0f392b', '#3b82f6', '#f59e0b']
      });
    } catch {
      // safe fallback if canvas is unavailable
    }
  }
}
