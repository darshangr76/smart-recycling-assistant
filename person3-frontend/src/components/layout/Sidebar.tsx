import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  BookOpen,
  MapPin,
  TrendingUp,
  Award,
  User,
  Settings,
  Recycle,
  Sparkles,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { RewardService } from '../../services/rewardService';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

interface NavItemDef {
  key: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_DEFINITIONS: NavItemDef[] = [
  { key: 'nav.dashboard', path: '/', icon: LayoutDashboard },
  { key: 'nav.scanner', path: '/scanner', icon: ScanLine, badge: 'AI' },
  { key: 'nav.guide', path: '/guide', icon: BookOpen },
  { key: 'nav.centers', path: '/centers', icon: MapPin },
  { key: 'nav.impact', path: '/impact', icon: TrendingUp },
  { key: 'nav.rewards', path: '/rewards', icon: Award },
  { key: 'nav.profile', path: '/profile', icon: User },
  { key: 'nav.settings', path: '/settings', icon: Settings },
  { key: 'Security & Auth', path: '/login', icon: ShieldCheck, badge: 'Auth' },
];

export const Sidebar: React.FC = () => {
  const profile = RewardService.getProfile();
  const { t } = useLanguage();
  const { currentColor } = useSettings();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-eco-border dark:border-white/10 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-xl h-screen sticky top-0 z-30 transition-colors duration-200 glass-premium">
      {/* Brand Logo Header */}
      <div className="p-6 pb-4 border-b border-eco-border/60 dark:border-white/10">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div
            className={`w-10 h-10 rounded-xl ${currentColor.bgClass} flex items-center justify-center text-white ${currentColor.glowClass} group-hover:scale-105 transition-all duration-300`}
          >
            <Recycle className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                SmartRecycle
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-emerald-400 border border-white/10">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Smart Waste Assistant</p>
          </div>
        </NavLink>
      </div>

      {/* Prominent Scan Action Button */}
      <div className="px-4 pt-4 pb-2">
        <NavLink
          to="/scanner"
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white ${currentColor.bgClass} hover:opacity-90 ${currentColor.glowClass} hover:scale-105 active:scale-95 transition-all duration-200 group btn-magnetic`}
        >
          <ScanLine className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          <span>{t('nav.scanner')}</span>
          <Sparkles className="w-3.5 h-3.5 text-white/80 ml-auto" />
        </NavLink>
      </div>

      {/* Nav List with dynamic translations */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {NAV_DEFINITIONS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
              style={({ isActive }) =>
                isActive ? { color: currentColor.hex } : {}
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full shadow-sm"
                      style={{ backgroundColor: currentColor.hex }}
                    />
                  )}
                  <Icon
                    className="w-4 h-4 shrink-0 transition-colors ml-0.5"
                    style={isActive ? { color: currentColor.hex } : {}}
                  />
                  <span className="truncate flex-1 min-w-0">
                    {item.key.startsWith('nav.') ? t(item.key) : item.key}
                  </span>
                  {item.badge && (
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-emerald-400 border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Progress Mini Card at bottom */}
      <div className="p-4 border-t border-eco-border/60 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
        <NavLink
          to="/rewards"
          className="block p-3 rounded-xl bg-white dark:bg-[#0B0F19]/80 border border-eco-border dark:border-white/10 shadow-xs hover:border-white/20 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {profile.streakDays}-Day Streak
            </span>
            <span className="font-bold" style={{ color: currentColor.hex }}>
              {profile.points} pts
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((profile.points % 150) / 1.5, 100)}%`,
                backgroundColor: currentColor.hex
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span>Lvl {profile.level}: {profile.levelTitle}</span>
            <span className="text-[10px] font-semibold text-gray-400 hover:text-white">Rewards &rarr;</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
