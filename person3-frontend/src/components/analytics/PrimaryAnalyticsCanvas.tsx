import React from 'react';
import {
  Layers,
  Trash2,
  Recycle,
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface PrimaryAnalyticsProps {
  totalDivertedDisplay: string;
  divertedUnit: string;
  isCityWideMode: boolean;
  totalScannedDisplay: string;
  accuracyRate: number;
}

export const PrimaryAnalyticsCanvas: React.FC<PrimaryAnalyticsProps> = ({
  totalDivertedDisplay,
  divertedUnit,
  isCityWideMode,
  totalScannedDisplay,
  accuracyRate
}) => {
  const { currentColor } = useSettings();

  // Smart-bin fill telemetry
  const SMART_BINS = [
    {
      id: 'bin-a',
      name: 'Bin A: Dry Recyclables (PET/Metals)',
      fillPercent: 68,
      status: 'Optimal Fill',
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      subtext: 'Next municipal collection in 4 hours'
    },
    {
      id: 'bin-b',
      name: 'Bin B: Organic Wet Composting',
      fillPercent: 42,
      status: 'Aerobic Sensor OK',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      subtext: 'Moisture level 54% • Odor filter active'
    },
    {
      id: 'bin-c',
      name: 'Bin C: E-Waste & Cable Vault',
      fillPercent: 85,
      status: 'Near Capacity',
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      subtext: 'Auto-dispatch trigger sent to certified hub'
    },
    {
      id: 'bin-d',
      name: 'Bin D: Hazardous Battery Deposit',
      fillPercent: 24,
      status: 'Terminals Sealed',
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      subtext: 'Fire suppression inert gas barrier active'
    }
  ];

  const diversionRate = 78.4; // 78.4% recycled vs 21.6% landfill

  return (
    <div className="glass-card rounded-2xl p-7 sm:p-8 relative overflow-hidden animate-fade-in-up stagger-2">
      {/* Top Accent Gradient */}
      <div
        className="absolute top-0 inset-x-0 h-[2px]"
        style={{ background: `linear-gradient(to right, transparent, ${currentColor.hex}, transparent)` }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: currentColor.hex }}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Primary Analytics Canvas
              </h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono">
                Real-Time MRF Telemetry
              </span>
            </div>
            <p className="text-xs text-gray-400">
              High-priority macro diversion rate, net mass balance, and smart-bin fill capacities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Smart Bins Synced</span>
          </span>
        </div>
      </div>

      {/* Main Split Grid: Left (Diversion Rate & Gauges) | Right (Smart-Bin Capacity Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left Focus: Waste Diversion Ratio Canvas (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-black/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Current Diversion Ratio
            </span>
            <span className="text-xs font-bold font-mono" style={{ color: currentColor.hex }}>
              Grade A+ Purity
            </span>
          </div>

          {/* Big Diversion Percentage with Radial Indicator */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.2"
                />
                {/* Progress Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={currentColor.hex}
                  strokeWidth="3.2"
                  strokeDasharray={`${diversionRate}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-white tracking-tight">{diversionRate}%</span>
                <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Diverted</span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentColor.hex }} />
                    Recycled / Diverted
                  </span>
                  <span className="font-bold text-white">{diversionRate}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${diversionRate}%`, backgroundColor: currentColor.hex }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Landfill Bound
                  </span>
                  <span className="font-bold text-gray-400">{(100 - diversionRate).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500/80 rounded-full" style={{ width: `${100 - diversionRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Counter strip */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Total Clean Sorted</span>
              <span className="text-lg font-extrabold text-white font-mono">
                {totalDivertedDisplay} <span className="text-xs font-normal text-gray-400">{divertedUnit}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Sorting Accuracy</span>
              <span className="text-lg font-extrabold font-mono" style={{ color: currentColor.hex }}>
                {accuracyRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Focus: Real-Time Smart-Bin Capacity Bars (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart-Bin IoT Level Telemetry</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Ultrasonic Level Sensors</span>
          </div>

          <div className="space-y-3">
            {SMART_BINS.map((bin) => (
              <div
                key={bin.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full ${bin.color}`} />
                    <span>{bin.name}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold ${bin.textColor}`}>{bin.status}</span>
                    <span className="font-mono font-extrabold text-white">{bin.fillPercent}%</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full bg-gray-800/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${bin.color}`}
                    style={{ width: `${bin.fillPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span>{bin.subtext}</span>
                  <span className="text-gray-500">Live Ping</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
