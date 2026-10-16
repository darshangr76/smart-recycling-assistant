import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  Filter
} from 'lucide-react';
import { RecyclingService } from '../services/recyclingService';
import { RecyclingGuideItem, WasteCategory } from '../types';
import { useSettings } from '../context/SettingsContext';
import { RewardService } from '../services/rewardService';
import { useToast } from '../context/ToastContext';

export const GuidePage: React.FC = () => {
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'All'>('All');
  const [selectedItem, setSelectedItem] = useState<RecyclingGuideItem | null>(null);

  const categories: (WasteCategory | 'All')[] = [
    'All',
    ...RecyclingService.getCategories()
  ];

  const items = RecyclingService.searchItems(searchQuery, selectedCategory);

  const handleSelectItem = (item: RecyclingGuideItem) => {
    setSelectedItem(item);
    // Award minor reading points (once)
    RewardService.awardPointsForEvent(
      `guide-${item.id}`,
      RewardService.POINTS_PER_GUIDE_READ,
      'Read recycling guide item'
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Page Title & Municipal Advisory */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Recycling & Sorting Guide
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-emerald-300">
              Encyclopedic
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official preparation steps, common contamination mistakes, and disposal streams.
          </p>
        </div>

        {/* Municipality Disclaimer Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60 text-xs text-forest-950 dark:text-emerald-300">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Current rules tailored for <strong>{settings.municipality}</strong>. Always check with your local waste authority.
          </span>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items like pizza box, phone, battery, coffee cup, foil, glass jar..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-subtle"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 flex items-center justify-between">
        <span>Showing <strong>{items.length}</strong> items in database</span>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelectItem(item)}
            className="bg-white dark:bg-eco-darkSurface rounded-2xl border border-eco-border dark:border-eco-darkBorder p-5 shadow-subtle hover:shadow-card hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    item.recyclable
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {item.recyclable ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Recyclable</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-amber-600" />
                      <span>Non-Recyclable</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{item.category}</span>
              </div>

              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-eco-border/60 dark:border-eco-darkBorder/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {item.disposalMethod.split(' or ')[0]}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-eco-darkSurface rounded-2xl border border-eco-border dark:border-eco-darkBorder max-w-lg w-full p-6 shadow-2xl space-y-5 animate-slide-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                    selectedItem.recyclable
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {selectedItem.recyclable ? '✓ Commonly Recyclable' : '⚠ Non-Recyclable / Special Handling'}
                </span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                  {selectedItem.name}
                </h2>
                <p className="text-xs text-slate-400">{selectedItem.category}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedItem.summary}
            </p>

            {/* Preparation Steps */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preparation Steps</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {selectedItem.preparationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disposal Method */}
            <div className="p-3.5 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60 text-xs">
              <span className="font-bold text-forest-900 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                Disposal Method
              </span>
              <p className="text-slate-700 dark:text-slate-200 font-medium">
                {selectedItem.disposalMethod}
              </p>
            </div>

            {/* Common Mistakes */}
            {selectedItem.commonMistakes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Common Recycling Mistakes</span>
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  {selectedItem.commonMistakes.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Decomposition / Environmental Footprint */}
            {selectedItem.decompositionTime && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Landfill decomposition time: <strong>{selectedItem.decompositionTime}</strong></span>
              </div>
            )}

            {/* Eco Alternative */}
            {selectedItem.alternativeSuggestion && (
              <div className="p-3 rounded-xl bg-lime-50 dark:bg-lime-950/30 border border-lime-200 dark:border-lime-900 text-xs text-forest-950 dark:text-lime-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Sustainable Alternative:</span>
                  <span>{selectedItem.alternativeSuggestion}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 text-white font-bold text-xs"
            >
              Done Reading
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
