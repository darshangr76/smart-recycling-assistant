import { describe, it, expect, beforeEach } from 'vitest';
import { RewardService } from '../services/rewardService';

describe('RewardService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize default user reward profile with baseline points and badges', () => {
    const profile = RewardService.getProfile();
    expect(profile).toBeDefined();
    expect(profile.points).toBeGreaterThanOrEqual(0);
    expect(profile.level).toBeGreaterThanOrEqual(1);
    expect(profile.levelTitle).toBeDefined();
    expect(profile.unlockedBadgeIds.length).toBeGreaterThan(0);
  });

  it('should award direct points and advance user level appropriately', () => {
    const initialProfile = RewardService.getProfile();
    const initialPoints = initialProfile.points;

    // Award 300 points
    const { newTotal } = RewardService.awardDirectPoints(300, 'Test bonus');
    expect(newTotal).toBe(initialPoints + 300);

    const updatedProfile = RewardService.getProfile();
    expect(updatedProfile.points).toBe(newTotal);
    // Level formula: Math.floor(points / 150) + 1
    const expectedLevel = Math.floor(newTotal / 150) + 1;
    expect(updatedProfile.level).toBe(expectedLevel);
  });

  it('should prevent duplicate point awards for the exact same event ID', () => {
    const eventId = 'test-scan-event-12345';
    const firstResult = RewardService.awardPointsForEvent(eventId, 25, 'First scan');
    expect(firstResult.awarded).toBe(true);

    // Attempting same event ID again
    const secondResult = RewardService.awardPointsForEvent(eventId, 25, 'Duplicate scan');
    expect(secondResult.awarded).toBe(false);
    expect(secondResult.newTotal).toBe(firstResult.newTotal);
  });

  it('should allow claiming completed challenges only once and fire celebration', () => {
    const challenges = RewardService.getChallenges();
    const completedUnclaimed = challenges.find((c) => c.completed && !c.claimed);

    if (completedUnclaimed) {
      const initialProfile = RewardService.getProfile();
      const claimResult = RewardService.claimChallenge(completedUnclaimed.id);

      expect(claimResult.success).toBe(true);
      expect(claimResult.pointsAwarded).toBe(completedUnclaimed.pointsReward);

      // Verify points were added
      const profileAfter = RewardService.getProfile();
      expect(profileAfter.points).toBe(initialProfile.points + completedUnclaimed.pointsReward);
      expect(profileAfter.claimedChallengeIds).toContain(completedUnclaimed.id);

      // Attempt to claim again should fail
      const repeatClaim = RewardService.claimChallenge(completedUnclaimed.id);
      expect(repeatClaim.success).toBe(false);
      expect(repeatClaim.pointsAwarded).toBe(0);
    }
  });

  it('should return badges and reflect unlocked state from user profile', () => {
    const badges = RewardService.getBadges();
    expect(badges.length).toBeGreaterThan(0);

    const firstScanBadge = badges.find((b) => b.id === 'first-scan');
    expect(firstScanBadge).toBeDefined();
    expect(firstScanBadge?.isUnlocked).toBe(true);
  });
});
