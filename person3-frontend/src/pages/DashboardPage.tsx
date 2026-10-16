import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanLine,
  Camera,
  BookOpen,
  MapPin,
  TrendingUp,
  Leaf,
  Scale,
  CheckCircle,
  Flame,
  ArrowRight,
  Sparkles,
  Award,
  Navigation,
  Zap,
  TreePine,
  Car,
  Droplets,
  Globe2,
  Users,
  Crown,
  Shield,
  Target,
  ChevronRight,
  Calendar,
  Clock,
  ArrowUpRight,
  Recycle,
  Image,
  Building2
} from 'lucide-react';
import { LiveGpsRadarFinder } from '../components/gps/LiveGpsRadarFinder';
import { ThumbnailShowcaseModal } from '../components/common/ThumbnailShowcaseModal';
import { PrimaryAnalyticsCanvas } from '../components/analytics/PrimaryAnalyticsCanvas';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import confetti from 'canvas-confetti';
import { ImpactService, RecordedScanEvent } from '../services/impactService';
import { RewardService } from '../services/rewardService';
import { LocationService, LiveLocationData } from '../services/locationService';
import { ImpactMetrics, UserRewardProfile, RecyclingCenter, Badge, Challenge } from '../types';
import { AuthService, SupabaseAuthUser } from '../services/supabaseClient';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useOffline } from '../context/OfflineContext';

const CATEGORY_COLORS = [
  '#10b981', '#06b6d4', '#84cc16', '#0284c7',
  '#f59e0b', '#8b5cf6', '#ef4444', '#64748b',
];

// ─── Animated Counter Hook ────────────────────────────────
const useAnimatedCounter = (end: number, duration: number = 1200, decimals: number = 0): string => {
  const [display, setDisplay] = useState('0');
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * end;
      setDisplay(decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString());
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, decimals]);

  return display;
};

// ─── Sparkline SVG Component ──────────────────────────────
const Sparkline: React.FC<{ color: string; points: number[]; filled?: boolean }> = ({ color, points, filled = true }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 120;
  const height = 36;
  const step = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${height} L ${coords.join(' L ')} L ${width},${height} Z`;
  const gradId = `spark-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg className="w-28 h-9 overflow-visible opacity-80 group-hover:opacity-100 transition-opacity" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {filled && <path d={areaD} fill={`url(#${gradId})`} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Endpoint glow dot */}
      <circle cx={coords[coords.length - 1].split(',')[0]} cy={coords[coords.length - 1].split(',')[1]} r="3" fill={color} opacity="0.9" />
    </svg>
  );
};

// ─── Ambient Particle Component ───────────────────────────
const AmbientParticles: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          width: `${3 + Math.random() * 4}px`,
          height: `${3 + Math.random() * 4}px`,
          backgroundColor: color,
          left: `${10 + Math.random() * 80}%`,
          top: `${20 + Math.random() * 60}%`,
          animationDelay: `${i * 1.1}s`,
          animationDuration: `${5 + Math.random() * 3}s`,
          opacity: 0.3,
        }}
      />
    ))}
  </div>
);

// ─── Leaderboard Data ─────────────────────────────────────
const LEADERBOARD = [
  { rank: 1, name: 'Priya K.', avatar: '👩‍💻', pts: 4820, city: 'Bengaluru' },
  { rank: 2, name: 'Arjun S.', avatar: '👨‍🔬', pts: 4510, city: 'Mumbai' },
  { rank: 3, name: 'Sneha R.', avatar: '👩‍🎓', pts: 4290, city: 'Delhi' },
  { rank: 4, name: 'You', avatar: '🌟', pts: 0, city: '' },
  { rank: 5, name: 'Ravi M.', avatar: '👨‍💼', pts: 3650, city: 'Chennai' },
];

// ─── Daily Eco Tips ───────────────────────────────────────
const ECO_TIPS = [
  {
    title: 'The "Wishcycling" Trap',
    body: 'When in doubt, avoid tossing uncertain items into curbside recycling. Contaminating a load can cause clean paper to be rejected and diverted to landfills!',
    icon: '🎯'
  },
  {
    title: 'Rinse Before You Recycle',
    body: 'A quick 5-second rinse of food containers can prevent an entire recycling batch from being rejected. Clean recyclables = successful recycling.',
    icon: '💧'
  },
  {
    title: 'Flatten Your Cardboard',
    body: 'Flattened cardboard saves 75% more space in recycling trucks. More space = fewer trips = less CO₂ emissions from collection vehicles.',
    icon: '📦'
  }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, currentColor, updateSettings } = useSettings();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { effectiveOnline, isSimulatedOffline, toggleSimulatedOffline, pendingSyncCount, syncPendingScans } = useOffline();

  const [metrics, setMetrics] = useState<ImpactMetrics>(() => ImpactService.calculateMetrics());
  const [recentScans, setRecentScans] = useState<RecordedScanEvent[]>([]);
  const [rewardProfile, setRewardProfile] = useState<UserRewardProfile>(() => RewardService.getProfile());
  const [badges, setBadges] = useState<Badge[]>(() => RewardService.getBadges());
  const [challenges, setChallenges] = useState<Challenge[]>(() => RewardService.getChallenges());
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);

  // Live Location
  const [liveLocation, setLiveLocation] = useState<LiveLocationData>({
    lat: settings.lastKnownCoords?.lat || 12.9716,
    lng: settings.lastKnownCoords?.lng || 77.5946,
    accuracy: 12,
    cityName: settings.lastKnownCoords?.city || settings.municipality,
    isLive: false,
    timestamp: Date.now()
  });
  const [nearbyCenters, setNearbyCenters] = useState<RecyclingCenter[]>([]);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [ecoTipIndex] = useState(() => Math.floor(Math.random() * ECO_TIPS.length));
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const telemetryRef = useRef<HTMLDivElement>(null);
  const [isCityWideMode, setIsCityWideMode] = useState<boolean>(false);
  const CITY_SCALE_MULTIPLIER = 12450; // 12,450 active citizens scale

  useEffect(() => {
    setMetrics(ImpactService.calculateMetrics());
    setRecentScans(ImpactService.getHistory().slice(0, 5));
    setRewardProfile(RewardService.getProfile());
    setBadges(RewardService.getBadges());
    setChallenges(RewardService.getChallenges());
    AuthService.getCurrentUser().then(setUser);
    const centers = LocationService.getCenters(liveLocation.lat, liveLocation.lng);
    setNearbyCenters(centers.slice(0, 2));
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (telemetryRef.current && !telemetryRef.current.contains(event.target as Node)) {
        setTelemetryOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const handleRefreshLiveLocation = async () => {
    setIsDetectingGps(true);
    showToast('Detecting GPS', 'Reading high-precision geolocation satellite coordinates...', 'info');
    const pos = await LocationService.getUserPosition();
    setIsDetectingGps(false);
    if (pos) {
      setLiveLocation(pos);
      updateSettings({
        municipality: pos.cityName,
        lastKnownCoords: { lat: pos.lat, lng: pos.lng, city: pos.cityName }
      });
      const centers = LocationService.getCenters(pos.lat, pos.lng);
      setNearbyCenters(centers.slice(0, 2));
      showToast('Live Location Updated', `Locked to ${pos.cityName} (${pos.lat.toFixed(3)}°N, ${pos.lng.toFixed(3)}°E)`, 'success');
    } else {
      showToast('Location Denied', 'Please grant location access in browser address bar.', 'error');
    }
  };

  const handleClaimChallenge = (challengeId: string) => {
    RewardService.claimChallenge(challengeId);
    setRewardProfile(RewardService.getProfile());
    setChallenges(RewardService.getChallenges());
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    showToast('Challenge Claimed! 🎉', 'Earned reward points towards your next eco rank!', 'success');
  };

  // Effective metrics scaled by City Multiplier
  const effectiveScanned = isCityWideMode
    ? metrics.totalItemsScanned * CITY_SCALE_MULTIPLIER
    : metrics.totalItemsScanned;
  const effectiveDivertedKg = isCityWideMode
    ? (metrics.totalDivertedKg * CITY_SCALE_MULTIPLIER) / 1000 // In metric tons
    : metrics.totalDivertedKg;
  const effectiveCo2Kg = isCityWideMode
    ? (metrics.totalCo2SavedKg * CITY_SCALE_MULTIPLIER) / 1000 // In metric tons
    : metrics.totalCo2SavedKg;
  const effectiveTrees = isCityWideMode
    ? Math.round(metrics.treesEquivalent * CITY_SCALE_MULTIPLIER)
    : metrics.treesEquivalent;
  const effectiveCarMiles = isCityWideMode
    ? Math.round(metrics.carMilesAvoided * CITY_SCALE_MULTIPLIER)
    : metrics.carMilesAvoided;
  const effectiveWater = isCityWideMode
    ? Math.round((metrics.waterSavedLiters * CITY_SCALE_MULTIPLIER) / 1000) // In kL
    : metrics.waterSavedLiters;

  // Animated counters
  const animatedTotal = useAnimatedCounter(effectiveScanned, 800);
  const animatedDiverted = useAnimatedCounter(effectiveDivertedKg, 800, isCityWideMode ? 1 : 1);
  const animatedCo2 = useAnimatedCounter(effectiveCo2Kg, 800, isCityWideMode ? 1 : 2);
  const animatedAccuracy = useAnimatedCounter(metrics.recyclingAccuracyRate, 800);

  // Pie data
  const pieData = Object.entries(metrics.categoryTotals)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({ name: category, value: count }));

  // Update leaderboard with user points
  const leaderboardData = LEADERBOARD.map(entry =>
    entry.name === 'You'
      ? { ...entry, pts: rewardProfile.points, city: liveLocation.cityName || 'Your City' }
      : entry
  );

  const tip = ECO_TIPS[ecoTipIndex];

  return (
    <div className="space-y-8 pb-12">
      {/* Compact status row — secondary telemetry recedes */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${effectiveOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${effectiveOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            {effectiveOnline ? 'Online' : 'Edge offline'}
          </span>
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[11px] text-slate-400">
            {liveLocation.cityName}
          </span>
        </div>

        <div className="flex items-center gap-2" ref={telemetryRef}>
          {pendingSyncCount > 0 && (
            <button
              onClick={async () => {
                const count = await syncPendingScans();
                showToast('Offline Queue Synced! 🎉', `Synced ${count} items with bonus resilience points!`, 'success');
              }}
              className="px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/25 hover:bg-amber-500/25 transition-all font-semibold text-[11px]"
            >
              Sync ({pendingSyncCount})
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setTelemetryOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-[11px] text-slate-400 hover:text-slate-200 transition-all"
              aria-expanded={telemetryOpen}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>System</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${telemetryOpen ? 'rotate-90' : ''}`} />
            </button>

            {telemetryOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 z-30 rounded-xl glass-card p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Latency</span>
                  <span className="font-mono text-slate-200">{effectiveOnline ? '14ms' : '0ms (local)'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">GPS</span>
                  <span className="text-slate-200">{liveLocation.cityName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Build</span>
                  <span className="font-mono text-slate-300">CORE V2.4 · Hackathon</span>
                </div>
                <button
                  onClick={() => {
                    toggleSimulatedOffline();
                    showToast(
                      isSimulatedOffline ? 'Online Mode Restored' : 'Simulated Offline Active',
                      isSimulatedOffline ? 'Connected to cloud services' : 'Edge heuristic mode activated',
                      'info'
                    );
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-medium"
                  title="Toggle offline demo simulation for hackathon tests"
                >
                  {isSimulatedOffline ? 'Restore online' : 'Simulate offline'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO BANNER — Glassmorphic with Gradient Mesh & HUD Brackets
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl glass-card hud-corner-brackets card-premium p-7 sm:p-10 shadow-xl animate-fade-in-up stagger-1">
        {/* Ambient particles */}
        <AmbientParticles color={currentColor.hex} />

        {/* Top gradient accent line */}
        <div
          className="absolute top-0 inset-x-0 h-[2px]"
          style={{
            background: `linear-gradient(to right, transparent, ${currentColor.hex}, transparent)`
          }}
        />

        {/* Background gradient mesh blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full gradient-mesh opacity-[0.07] blur-3xl"
            style={{ background: `radial-gradient(circle, ${currentColor.hex}, transparent 70%)` }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full gradient-mesh opacity-[0.05] blur-3xl"
            style={{ background: `radial-gradient(circle, #06b6d4, transparent 70%)`, animationDelay: '4s' }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Welcome & Actions */}
          <div className="lg:col-span-7 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            {/* Platform badge & Community Impact Scaler Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide">
                <span
                  className="w-2 h-2 rounded-full animate-live-blink"
                  style={{ backgroundColor: currentColor.hex }}
                />
                <span className="text-gray-300">{t('dash.platformTag')}</span>
              </div>

              {/* Community Multiplier / City-Wide Scale Toggle */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner">
                <button
                  onClick={() => {
                    setIsCityWideMode(false);
                    showToast('Personal Impact Active', 'Viewing your verified individual recycling data.', 'info');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isCityWideMode
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => {
                    setIsCityWideMode(true);
                    showToast('City-Wide Scaler Active 🏙️', `Simulating macro impact across 12,450 citizens in ${liveLocation.cityName}!`, 'success');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCityWideMode
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-200" />
                  <span>City-Wide Scale</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20">12,450x</span>
                </button>
              </div>
            </div>

            {/* City-Wide Macro Impact Alert Banner */}
            {isCityWideMode && (
              <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-transparent border border-blue-500/30 flex items-center justify-between gap-3 text-xs animate-slide-in">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🏙️</span>
                  <div>
                    <h5 className="font-bold text-white text-xs">
                      Simulated City-Wide Scale Active ({CITY_SCALE_MULTIPLIER.toLocaleString()} citizens in {liveLocation.cityName})
                    </h5>
                    <p className="text-[11px] text-blue-300/90 mt-0.5">
                      Equivalent to removing 45 cars off Outer Ring Road this week, diverting {animatedDiverted} tons from landfills!
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  MACRO SCALE
                </span>
              </div>
            )}

            {/* Greeting */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t('dash.welcome')},{' '}
              <span className="text-shimmer">{user?.name || 'Alex'}</span>! 👋
            </h1>

            <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xl">
              {t('dash.streakMsg', { streak: rewardProfile.streakDays })}
            </p>

            {/* Clear Action Hierarchy */}
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3.5">
                {/* Primary Action */}
                <button
                  onClick={() => navigate('/scanner')}
                  className={`group/btn flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white ${currentColor.bgClass} ${currentColor.glowClass} hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg`}
                >
                  <Camera className="w-5 h-5 text-white group-hover/btn:rotate-12 transition-transform" />
                  <span>{t('dash.openCamera')}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                </button>

                {/* Secondary Action */}
                <button
                  onClick={() => navigate('/scanner')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  <ScanLine className="w-4 h-4 text-emerald-400" />
                  <span>{t('dash.uploadPresets')}</span>
                </button>
              </div>

              {/* Subordinate Utility Links */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <button
                  onClick={() => setShowThumbnailModal(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-300 transition-colors"
                >
                  <Image className="w-3.5 h-3.5 text-emerald-400" />
                  <span>App Thumbnail</span>
                </button>
                <span className="text-white/10">•</span>
                <button
                  onClick={() => navigate('/guide')}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('dash.recyclingGuide')}</span>
                </button>
                <span className="text-white/10">•</span>
                <button
                  onClick={() => navigate('/centers')}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('dash.findCenters')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feed Activity Panel */}
          <div className="lg:col-span-5 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-live-blink" style={{ backgroundColor: currentColor.hex }} />
                  <span>{t('dash.liveFeed')}</span>
                </span>
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Real-time
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { emoji: '🥤', item: 'Plastic PET Bottle', bin: 'Curbside Blue Bin', pts: 20, time: '2 mins ago' },
                  { emoji: '📦', item: 'Corrugated Cardboard', bin: 'Flattened & Clean', pts: 20, time: '14 mins ago' },
                  { emoji: '🔋', item: 'Lithium Battery', bin: 'Hazardous Depot', pts: 20, time: '1 hour ago', warn: true },
                ].map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-lg">{entry.emoji}</span>
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">{entry.item}</p>
                        <p className={`text-[10px] ${entry.warn ? 'text-amber-400' : 'text-gray-400'}`}>{entry.bin}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-[11px]" style={{ color: currentColor.hex }}>+{entry.pts} pts</span>
                        <p className="text-[11px] text-slate-400">{entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ZONE 1: PRIMARY ANALYTICS CANVAS (Top-Left Focus)
          ═══════════════════════════════════════════════════════════ */}
      <PrimaryAnalyticsCanvas
        totalDivertedDisplay={animatedDiverted}
        divertedUnit={isCityWideMode ? 'Tons' : 'kg'}
        isCityWideMode={isCityWideMode}
        totalScannedDisplay={animatedTotal}
        accuracyRate={metrics.recyclingAccuracyRate}
      />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: KPI METRIC CARDS — Animated Counters + Sparklines
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: isCityWideMode ? 'CITY TOTAL SCANNED' : t('dash.totalScanned'),
            value: animatedTotal,
            unit: '',
            subtext: isCityWideMode ? '↗ 12,450 active citizens' : '↗ +12% this week',
            subtextColor: 'text-blue-400',
            icon: <ScanLine className="w-4 h-4" />,
            iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            gradient: 'before:from-blue-500 before:to-cyan-400',
            sparkColor: '#38bdf8',
            sparkData: [8, 11, 14, 12, 18, 22, 24, 27],
            stagger: 'stagger-2',
          },
          {
            label: isCityWideMode ? 'CITY LANDFILL DIVERTED' : t('dash.landfillDiverted'),
            value: animatedDiverted,
            unit: isCityWideMode ? 'Tons' : 'kg',
            subtext: isCityWideMode ? '↗ Clean mass diverted' : '↗ Clean mass sorted',
            subtextColor: 'text-emerald-400',
            icon: <Scale className="w-4 h-4" />,
            iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            gradient: 'before:from-emerald-500 before:to-teal-400',
            sparkColor: '#10b981',
            sparkData: [0.4, 0.7, 0.9, 1.1, 1.25, 1.38, 1.49],
            stagger: 'stagger-3',
          },
          {
            label: isCityWideMode ? 'CITY CO₂e AVOIDED' : t('dash.co2Avoided'),
            value: animatedCo2,
            unit: isCityWideMode ? 'Tons' : 'kg',
            subtext: isCityWideMode ? `≈ ${effectiveTrees.toLocaleString()} urban seedlings` : `≈ ${metrics.treesEquivalent} urban seedlings`,
            subtextColor: 'text-teal-400',
            icon: <Leaf className="w-4 h-4" />,
            iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            gradient: 'before:from-teal-400 before:to-emerald-500',
            sparkColor: '#2dd4bf',
            sparkData: [0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.38],
            stagger: 'stagger-4',
          },
          {
            label: t('dash.accuracy'),
            value: animatedAccuracy,
            unit: '%',
            subtext: 'Verified compliance',
            subtextColor: 'text-indigo-400',
            icon: <CheckCircle className="w-4 h-4" />,
            iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            gradient: 'before:from-indigo-500 before:to-sky-400',
            sparkColor: '#818cf8',
            sparkData: [92, 94, 91, 95, 96, 95, 96],
            stagger: 'stagger-5',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`group relative overflow-hidden glass-card p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up ${card.stagger} before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b ${card.gradient}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-4xl font-extrabold text-white tracking-tight tabular-nums">
                  {card.value}
                  {card.unit && <span className="text-sm font-normal text-gray-400 ml-1">{card.unit}</span>}
                </div>
                <p className={`text-xs ${card.subtextColor} font-medium mt-1`}>
                  {card.subtext}
                </p>
              </div>
              <Sparkline color={card.sparkColor} points={card.sparkData} />
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: ENVIRONMENTAL EQUIVALENCY HERO STRIP
          ═══════════════════════════════════════════════════════════ */}
      <div className="animate-fade-in-up stagger-5">
        <div className="relative overflow-hidden glass-card p-6 sm:p-8 border-glow">
          <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${currentColor.hex} 0%, transparent 50%)` }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: currentColor.hex }}
                >
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    {isCityWideMode ? 'City-Wide Environmental Equivalencies' : 'Your Environmental Equivalencies'}
                  </h2>
                  <p className="text-[10px] text-gray-400">
                    {isCityWideMode ? `Aggregated macro impact across 12,450 citizens in ${liveLocation.cityName}` : 'Real-world impact of your recycling actions'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                {isCityWideMode ? '12,450x Scale Active' : 'Individual Scale'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Trees Planted */}
              <div className="group flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 hover:bg-emerald-500/10 hover:border-emerald-500/25 transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <TreePine className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">{effectiveTrees.toLocaleString()}</div>
                  <p className="text-[11px] text-emerald-400/80 font-medium">Trees Worth of CO₂</p>
                  <p className="text-[10px] text-gray-500">{isCityWideMode ? 'urban forest footprint' : 'absorbed in one year'}</p>
                </div>
              </div>

              {/* Car Miles Avoided */}
              <div className="group flex items-center gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 hover:border-blue-500/25 transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">{effectiveCarMiles.toLocaleString()}</div>
                  <p className="text-[11px] text-blue-400/80 font-medium">Car Miles Avoided</p>
                  <p className="text-[10px] text-gray-500">{isCityWideMode ? 'emissions taken off roads' : 'in emissions equivalent'}</p>
                </div>
              </div>

              {/* Water Saved */}
              <div className="group flex items-center gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 hover:border-cyan-500/25 transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Droplets className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white tabular-nums">
                    {effectiveWater.toLocaleString()} {isCityWideMode ? 'kL' : 'L'}
                  </div>
                  <p className="text-[11px] text-cyan-400/80 font-medium">Water Conserved</p>
                  <p className="text-[10px] text-gray-500">{isCityWideMode ? 'city reservoir volume protected' : 'through material recovery'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: REWARDS + LEADERBOARD | LIVE LOCATION
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rewards & Badges + Community Leaderboard (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Rewards Card */}
          <div className="glass-card p-7 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden space-y-6 animate-fade-in-up stagger-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md animate-ring-pulse"
                  style={{ backgroundColor: currentColor.hex, '--ring-color': `${currentColor.hex}40` } as React.CSSProperties}
                >
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{t('dash.rewardsColumn')}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10" style={{ color: currentColor.hex }}>
                      Level {rewardProfile.level}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Earn points and badges for each verified sorting action and streak milestones.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-white">{rewardProfile.streakDays} {t('dash.dayStreak')}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl border font-extrabold text-sm" style={{ backgroundColor: `${currentColor.hex}15`, borderColor: `${currentColor.hex}30`, color: currentColor.hex }}>
                  {rewardProfile.points} pts
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-semibold">Rank: {rewardProfile.levelTitle}</span>
                <span className="text-gray-400">{rewardProfile.points} / 2,000 XP (Next: Eco Guardian)</span>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 animate-progress-glow"
                  style={{
                    width: `${Math.min((rewardProfile.points % 500) / 5, 100)}%`,
                    backgroundColor: currentColor.hex
                  }}
                />
              </div>
            </div>

            {/* Earned Badges */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentColor.hex }} />
                <span>{t('dash.earnedBadges')}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.slice(0, 4).map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border text-center transition-all hover:scale-105 ${
                      badge.isUnlocked
                        ? 'bg-white/5 border-white/10 hover:border-emerald-500/40'
                        : 'bg-black/20 border-white/5 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-lg mb-2 shadow-inner ${
                        badge.isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {badge.id === 'first-scan' && '🌟'}
                      {badge.id === 'plastic-hero' && '🛡️'}
                      {badge.id === 'battery-guardian' && '⚡'}
                      {badge.id === 'e-waste-champion' && '💻'}
                      {badge.id === 'master-composter' && '🌿'}
                      {badge.id === 'streak-master' && '🔥'}
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{badge.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                      {badge.isUnlocked ? 'Unlocked ✓' : `${badge.progressPercent}% to unlock`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" style={{ color: currentColor.hex }} />
                  <span>{t('dash.activeChallenge')}</span>
                </h3>
                <button
                  onClick={() => navigate('/rewards')}
                  className="text-xs font-semibold flex items-center gap-1 hover:underline transition-colors"
                  style={{ color: currentColor.hex }}
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {challenges.slice(0, 2).map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{ch.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${currentColor.hex}15`, borderColor: `${currentColor.hex}30`, color: currentColor.hex, border: '1px solid' }}>
                          +{ch.pointsReward} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{ch.description}</p>
                    </div>

                    <div className="shrink-0">
                      {ch.claimed ? (
                        <span className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 font-semibold text-xs">
                          {t('dash.claimed')}
                        </span>
                      ) : ch.completed ? (
                        <button
                          onClick={() => handleClaimChallenge(ch.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs text-white hover:opacity-90 shadow-sm transition-all hover:scale-105 active:scale-95`}
                          style={{ backgroundColor: currentColor.hex }}
                        >
                          {t('dash.claimReward')}
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {ch.currentCount}/{ch.targetCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Community Leaderboard Preview */}
          <div className="glass-card p-7 shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in-up stagger-7">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Crown className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Community Leaderboard</h2>
                  <p className="text-[10px] text-gray-400">Top eco-warriors this month</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/rewards')}
                className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Full Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {leaderboardData.map((entry) => {
                const isYou = entry.name === 'You';
                const isTop3 = entry.rank <= 3;
                const rankColors = ['', 'text-amber-400', 'text-gray-300', 'text-amber-600'];
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs transition-all ${
                      isYou
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-extrabold ${isTop3 ? rankColors[entry.rank] : 'text-gray-500'}`}>
                        {isTop3 ? ['', '🥇', '🥈', '🥉'][entry.rank] : `#${entry.rank}`}
                      </span>
                      <span className="text-base">{entry.avatar}</span>
                      <div>
                        <span className={`font-bold ${isYou ? 'text-white' : 'text-gray-200'}`}>
                          {entry.name}
                          {isYou && <span className="text-[9px] ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-gray-400">That's you!</span>}
                        </span>
                        <p className="text-[10px] text-gray-500">{entry.city}</p>
                      </div>
                    </div>
                    <div className="font-extrabold tabular-nums" style={{ color: isYou ? currentColor.hex : isTop3 ? '#f59e0b' : '#9ca3af' }}>
                      {entry.pts.toLocaleString()} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Location Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 animate-fade-in-up stagger-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" style={{ color: currentColor.hex }} />
                  <h3 className="text-sm font-bold text-white">{t('dash.liveLocation')}</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${currentColor.hex}15`, borderColor: `${currentColor.hex}30`, color: currentColor.hex, border: '1px solid' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: currentColor.hex }} />
                  <span>Live GPS</span>
                </span>
              </div>

              {/* GPS Coordinates */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Current Area</span>
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{liveLocation.cityName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Coordinates</span>
                  <span className="font-mono font-semibold" style={{ color: currentColor.hex }}>
                    {liveLocation.lat.toFixed(3)}°N, {liveLocation.lng.toFixed(3)}°E
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                  <span>Accuracy Radius</span>
                  <span>±{liveLocation.accuracy}m satellite fix</span>
                </div>
              </div>

              {/* Nearest Drop-off Centers */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {t('dash.nearestDropoff')}
                </div>

                {nearbyCenters.map((center) => (
                  <div
                    key={center.id}
                    className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="font-semibold text-white truncate">{center.name}</h5>
                      <p className="text-[10px] text-gray-400 truncate">{center.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-xs" style={{ color: currentColor.hex }}>
                        {center.distanceKm ? `${center.distanceKm} km` : 'Near'}
                      </span>
                      <a
                        href={LocationService.getDirectionsUrl(center.lat, center.lng, center.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[10px] text-gray-400 hover:text-white underline mt-0.5"
                      >
                        Maps ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={isDetectingGps}
              onClick={handleRefreshLiveLocation}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: currentColor.hex }}
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Locking GPS...' : t('dash.refreshLocation')}</span>
            </button>
          </div>

          {/* Daily Eco Tip */}
          <div className="glass-card p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-7">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{tip.icon}</div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: currentColor.hex }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('dash.dailyEcoTip')}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{tip.title}</h3>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {tip.body}
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-400">Want to test an item?</span>
              <button
                onClick={() => navigate('/scanner')}
                className="font-bold hover:opacity-80 flex items-center gap-1"
                style={{ color: currentColor.hex }}
              >
                <span>Open AI Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4B: LIVE GPS RADAR FINDER (navigator.geolocation)
          ═══════════════════════════════════════════════════════════ */}
      <div className="animate-fade-in-up stagger-7">
        <LiveGpsRadarFinder
          onLocationUpdate={(loc) => {
            setLiveLocation(loc);
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: CHARTS & ANALYTICS ROW
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-2 glass-card p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up stagger-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{t('dash.weeklyActivity')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Scanned items sorted across the past 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${currentColor.hex}15`, borderColor: `${currentColor.hex}30`, color: currentColor.hex, border: '1px solid' }}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Last 7 Days</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F19',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} items`, 'Scanned']}
                />
                <Bar dataKey="items" fill={currentColor.hex} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Distribution Pie Chart */}
        <div className="glass-card p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between animate-fade-in-up stagger-8">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">{t('dash.materialStreams')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribution by classified material</p>
          </div>

          <div className="h-48 w-full my-auto flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F19',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <Recycle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No scanned items yet</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[11px]">
            {pieData.slice(0, 4).map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                <span className="truncate text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>

          {/* Stream Quality & Health Traceability Index */}
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-gray-300">Overall Stream Purity</span>
              <span className="font-mono font-bold text-emerald-400">96.4% (Grade A+)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 border border-white/5">
                <span>Plastics Purity</span>
                <span className="font-bold text-white font-mono">94%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 border border-white/5">
                <span>Paper/Cardboard</span>
                <span className="font-bold text-white font-mono">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: RECENT SCANS
          ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card p-7 shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in-up stagger-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">{t('dash.recentScans')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest items identified by SmartRecycle AI</p>
          </div>
          <button
            onClick={() => navigate('/scanner')}
            className="text-xs font-semibold flex items-center gap-1 hover:underline underline-offset-4 transition-colors"
            style={{ color: currentColor.hex }}
          >
            <span>{t('dash.scanMore')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {recentScans.length > 0 ? (
            recentScans.map((scan, i) => (
              <div key={scan.id} className="py-3 flex items-center justify-between gap-3 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                    <ScanLine className="w-5 h-5" style={{ color: currentColor.hex }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{scan.itemName}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium" style={{ color: currentColor.hex }}>{scan.category}</span>
                      <span>•</span>
                      <span className="text-slate-400">{new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      scan.recyclable
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {scan.recyclable ? 'Recyclable' : 'Special Stream'}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {scan.co2SavedKg > 0 ? `-${scan.co2SavedKg} kg CO₂` : 'Sorted'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <Camera className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No items scanned yet</p>
              <p className="text-xs text-gray-500 mt-1">Click "{t('dash.openCamera')}" to start scanning!</p>
            </div>
          )}
        </div>
      </div>

      {/* Official Frontend Thumbnail Showcase & Download Modal */}
      <ThumbnailShowcaseModal
        isOpen={showThumbnailModal}
        onClose={() => setShowThumbnailModal(false)}
      />
    </div>
  );
};
