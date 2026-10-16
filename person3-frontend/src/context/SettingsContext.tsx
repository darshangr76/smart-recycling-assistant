import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, ColorTheme, LanguageCode } from '../types';

export interface ColorPreset {
  id: ColorTheme;
  name: string;
  hex: string;
  hoverHex: string;
  rgb: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'neon-green',
    name: 'Neon Green (#00E676)',
    hex: '#00E676',
    hoverHex: '#00c853',
    rgb: '0, 230, 118',
    bgClass: 'bg-[#00E676]',
    textClass: 'text-[#00E676]',
    borderClass: 'border-[#00E676]/30',
    glowClass: 'shadow-[0_0_20px_rgba(0,230,118,0.4)]'
  },
  {
    id: 'emerald',
    name: 'Emerald Eco',
    hex: '#10b981',
    hoverHex: '#059669',
    rgb: '16, 185, 129',
    bgClass: 'bg-emerald-600',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]'
  },
  {
    id: 'teal',
    name: 'Cyber Teal',
    hex: '#14b8a6',
    hoverHex: '#0d9488',
    rgb: '20, 184, 166',
    bgClass: 'bg-teal-600',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    hex: '#3b82f6',
    hoverHex: '#2563eb',
    rgb: '59, 130, 246',
    bgClass: 'bg-blue-600',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.35)]'
  },
  {
    id: 'purple',
    name: 'Royal Violet',
    hex: '#8b5cf6',
    hoverHex: '#7c3aed',
    rgb: '139, 92, 246',
    bgClass: 'bg-purple-600',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.35)]'
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    hex: '#f59e0b',
    hoverHex: '#d97706',
    rgb: '245, 158, 11',
    bgClass: 'bg-amber-600',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    hex: '#f43f5e',
    hoverHex: '#e11d48',
    rgb: '244, 63, 94',
    bgClass: 'bg-rose-600',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]'
  },
  {
    id: 'lime',
    name: 'Electric Lime',
    hex: '#84cc16',
    hoverHex: '#65a30d',
    rgb: '132, 204, 22',
    bgClass: 'bg-lime-600',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(132,204,22,0.35)]'
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    hex: '#06b6d4',
    hoverHex: '#0891b2',
    rgb: '6, 182, 212',
    bgClass: 'bg-cyan-600',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
    glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]'
  }
];

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setColorTheme: (color: ColorTheme) => void;
  currentColor: ColorPreset;
  colorPresets: ColorPreset[];
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  municipality: 'San Francisco, CA',
  unitSystem: 'metric',
  enableSound: true,
  useDemoMode: false,
  customApiUrl: '',
  theme: 'dark',
  colorTheme: 'neon-green',
  language: 'en',
  liveLocationEnabled: true,
  lastKnownCoords: { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const raw = localStorage.getItem('smart_recycle_settings');
    if (raw) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const currentColor =
    COLOR_PRESETS.find((c) => c.id === settings.colorTheme) || COLOR_PRESETS[0];

  useEffect(() => {
    localStorage.setItem('smart_recycle_settings', JSON.stringify(settings));

    // Apply dark mode class to html element
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply color theme data attribute and CSS custom variables
    document.documentElement.setAttribute('data-color', settings.colorTheme || 'emerald');
    document.documentElement.style.setProperty('--color-accent-rgb', currentColor.rgb);
    document.documentElement.style.setProperty('--color-accent-hex', currentColor.hex);
    document.documentElement.style.setProperty('--color-accent-hover', currentColor.hoverHex);
  }, [settings, currentColor]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setColorTheme = (colorTheme: ColorTheme) => {
    setSettings((prev) => ({ ...prev, colorTheme }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleTheme,
        setTheme,
        setColorTheme,
        currentColor,
        colorPresets: COLOR_PRESETS,
        resetToDefaults
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
