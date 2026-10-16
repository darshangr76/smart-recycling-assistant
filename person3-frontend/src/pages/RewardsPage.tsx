import React, { useState } from 'react';
import {
  Award,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Leaf,
  Trophy,
  Gift,
  ArrowRight
} from 'lucide-react';
import { RewardService } from '../services/rewardService';
import { Badge, Challenge, UserRewardProfile } from '../types';
import { useToast } from '../context/ToastContext';

export const RewardsPage: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserRewardProfile>(() => RewardService.getProfile());
  const [challenges, setChallenges] = useState<Challenge[]>(() => RewardService.getChallenges());
  const [badges] = useState<Badge[]>(() => RewardService.getBadges());

  const handleClaim = (challengeId: string) => {
    const res = RewardService.claimChallenge(challengeId);
    if (res.success) {
      setProfile(RewardService.getProfile());
      setChallenges(RewardService.getChallenges());
      showToast(
        'Challenge Reward Claimed! 🌟',
        `Earned +${res.pointsAwarded} Eco Points! Keep up the green momentum.`,
        'success'
      );
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Leaf': return <Leaf className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const nextLevelPoints = profile.level * 150;
  const currentLevelBase = (profile.level - 1) * 150;
  const progressPercent = Math.min(
    Math.round(((profile.points - currentLevelBase) / 150) * 100),
    100
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Gamification Status Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-800 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-lime-400 text-forest-950 uppercase tracking-wider">
                Level {profile.level}: {profile.levelTitle}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile.streakDays}-Day Streak</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black">
              {profile.points} <span className="text-xl font-bold text-emerald-200">Eco Points</span>
            </h1>

            <p className="text-xs text-emerald-100/90 mt-1 max-w-md">
              Earn points with every verified scan, properly prepared recyclable, and completed challenge.
            </p>
          </div>

          {/* Level Progress Circle / Bar */}
          <div className="sm:text-right min-w-[200px]">
            <div className="text-xs text-emerald-200 mb-1 font-semibold">
              Level {profile.level + 1} unlocks at {nextLevelPoints} pts
            </div>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className="bg-gradient-to-r from-emerald-400 to-lime-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 10)}%` }}
              />
            </div>
            <div className="text-[11px] text-lime-300 mt-1 font-bold">
              {nextLevelPoints - profile.points} points until next rank
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Daily & Weekly Challenges</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete sustainability goals to unlock badges and bonus points.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className="bg-white dark:bg-eco-darkSurface rounded-2xl border border-eco-border dark:border-eco-darkBorder p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {ch.type}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    +{ch.pointsReward} pts
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {ch.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {ch.description}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((ch.currentCount / ch.targetCount) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                    <span>
                      {ch.currentCount} / {ch.targetCount} completed
                    </span>
                    <span>{ch.daysRemaining} days left</span>
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <div className="mt-4 pt-3 border-t border-eco-border/60 dark:border-eco-darkBorder/60">
                {ch.claimed ? (
                  <div className="w-full py-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    Claimed ✓
                  </div>
                ) : ch.completed ? (
                  <button
                    onClick={() => handleClaim(ch.id)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-forest-950 bg-lime-400 hover:bg-lime-300 shadow-sm transition-all flex items-center justify-center gap-1.5 animate-bounce"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Claim +{ch.pointsReward} Points</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-slate-400 font-medium">
                    In Progress ({Math.round((ch.currentCount / ch.targetCount) * 100)}%)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability Badges Grid */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Sustainability Badges ({badges.filter((b) => b.isUnlocked).length}/{badges.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Collect prestigious badges to showcase your environmental accomplishments.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                b.isUnlocked
                  ? 'bg-white dark:bg-eco-darkSurface border-emerald-300 dark:border-emerald-800 shadow-subtle'
                  : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                  b.isUnlocked
                    ? 'bg-gradient-to-br from-emerald-500 to-forest-900 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {getBadgeIcon(b.icon)}
              </div>

              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug">
                {b.name}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {b.description}
              </p>

              <div className="mt-2 text-[10px] font-bold">
                {b.isUnlocked ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Unlocked ✓</span>
                ) : (
                  <span className="text-slate-400">{b.progressPercent}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
