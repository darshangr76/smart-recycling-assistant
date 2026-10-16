import React, { useState } from 'react';
import {
  TrendingUp,
  Leaf,
  Scale,
  Car,
  Droplets,
  Trees,
  Battery,
  ShieldAlert,
  Info,
  Calendar,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { ImpactService } from '../services/impactService';
import { ImpactMetrics } from '../types';

export const ImpactPage: React.FC = () => {
  const [metrics] = useState<ImpactMetrics>(() => ImpactService.calculateMetrics());
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Title & Methodology Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Environmental Impact
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-100 dark:bg-lime-950 text-lime-900 dark:text-lime-300">
              LCA Modeling
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quantifying your avoided greenhouse gases, diverted mass, and natural resource conservation.
          </p>
        </div>

        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder text-slate-700 dark:text-slate-300 hover:border-emerald-500 shadow-xs transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Accounting Methodology</span>
        </button>
      </div>

      {/* Accounting Methodology Banner / Modal */}
      {showMethodology && (
        <div className="p-5 rounded-2xl bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-xs text-forest-950 dark:text-emerald-100 space-y-3 animate-slide-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm flex items-center gap-2 text-forest-900 dark:text-emerald-300">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Scientific Carbon Accounting Methodology & Disclosure</span>
            </h4>
            <button
              onClick={() => setShowMethodology(false)}
              className="font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            All environmental savings displayed in Smart Recycle AI are <strong>modeled estimates</strong>, not directly
            measured outcomes. Calculations apply peer-reviewed emission factors derived from the{' '}
            <strong>EPA Waste Reduction Model (WARM v15)</strong> and the <strong>UK DEFRA Greenhouse Gas Conversion Factors</strong>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-white/60 dark:bg-black/20">
              <strong>Plastics:</strong> 1.50 kg CO₂e / kg
            </div>
            <div className="p-2 rounded-lg bg-white/60 dark:bg-black/20">
              <strong>Aluminum:</strong> 9.00 kg CO₂e / kg
            </div>
            <div className="p-2 rounded-lg bg-white/60 dark:bg-black/20">
              <strong>Cardboard:</strong> 1.05 kg CO₂e / kg
            </div>
            <div className="p-2 rounded-lg bg-white/60 dark:bg-black/20">
              <strong>Compost:</strong> 0.52 kg CO₂e / kg
            </div>
          </div>
        </div>
      )}

      {/* Core Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Landfill Diverted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Waste Diverted</span>
            <Scale className="w-5 h-5 text-forest-700 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {metrics.totalDivertedKg} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kept out of municipal landfills</p>
        </div>

        {/* Stat 2: CO2 Avoided */}
        <div className="p-5 rounded-2xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Emissions Avoided</span>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {metrics.totalCo2SavedKg} <span className="text-sm font-semibold text-slate-500">kg CO₂e</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Net GHG reduction</p>
        </div>

        {/* Stat 3: Trees Equivalent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tree Carbon Equiv.</span>
            <Trees className="w-5 h-5 text-lime-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {metrics.treesEquivalent}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Urban seedlings grown for 10 yrs</p>
        </div>

        {/* Stat 4: Water Conserved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Water Conserved</span>
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {metrics.waterSavedLiters} <span className="text-sm font-semibold text-slate-500">Liters</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saved from pulp & smelting cycles</p>
        </div>
      </div>

      {/* Real-World Equivalencies Grid */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-forest-900 to-emerald-900 text-white shadow-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-lime-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Real-World Equivalencies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-lime-400 text-forest-950 flex items-center justify-center font-bold shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{metrics.carMilesAvoided}</div>
              <div className="text-xs text-emerald-100">Gasoline vehicle miles avoided</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-400 text-forest-950 flex items-center justify-center font-bold shrink-0">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{Math.round(metrics.totalCo2SavedKg * 122)}</div>
              <div className="text-xs text-emerald-100">Smartphone battery recharges</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-forest-950 flex items-center justify-center font-bold shrink-0">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{metrics.treesEquivalent}</div>
              <div className="text-xs text-emerald-100">Forest seedlings equivalent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Area Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Cumulative Savings Over Time</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly trajectory of diverted mass & avoided CO₂</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">5-Month Trend</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f392b',
                  borderColor: '#10b981',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="weightKg" stroke="#10b981" fillOpacity={1} fill="url(#colorWeight)" name="Diverted (kg)" />
              <Area type="monotone" dataKey="co2Kg" stroke="#84cc16" fillOpacity={1} fill="url(#colorCo2)" name="Avoided CO₂ (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
