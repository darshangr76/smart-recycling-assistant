import React, { useState } from 'react';
import {
  Settings,
  MapPin,
  Moon,
  Sun,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Code2,
  Server,
  Palette,
  Globe,
  Navigation,
  Sparkles,
  Laptop
} from 'lucide-react';
import { useSettings, COLOR_PRESETS } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { LocationService } from '../services/locationService';
import { ColorTheme, LanguageCode } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, setTheme, setColorTheme, currentColor, resetToDefaults } = useSettings();
  const { language, setLanguage, languages, t } = useLanguage();
  const { showToast } = useToast();

  const [apiUrlInput, setApiUrlInput] = useState(settings.customApiUrl || 'https://contracting-eur-persons-newton.trycloudflare.com');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSaveApi = () => {
    updateSettings({ customApiUrl: apiUrlInput });
    localStorage.setItem('smart_recycle_custom_api', apiUrlInput);
    showToast('Settings Saved', 'Custom AI API endpoint updated.', 'success');
  };

  const handleDetectLiveLocation = async () => {
    setIsDetectingGps(true);
    showToast('Detecting GPS', 'Accessing browser geolocation hardware...', 'info');

    const pos = await LocationService.getUserPosition();
    setIsDetectingGps(false);

    if (pos) {
      updateSettings({
        municipality: pos.cityName,
        lastKnownCoords: { lat: pos.lat, lng: pos.lng, city: pos.cityName }
      });
      showToast('Live Location Locked', `Acquired coordinates ${pos.lat.toFixed(4)}° N, ${pos.lng.toFixed(4)}° E (${pos.cityName})`, 'success');
    } else {
      showToast('GPS Denied', 'Browser location permission denied. Check address bar permissions.', 'error');
    }
  };

  const handleTestConnection = async () => {
    if (!apiUrlInput) {
      setTestStatus({ success: false, message: 'Please provide a valid backend URL first.' });
      return;
    }
    setIsTestingApi(true);
    setTestStatus(null);

    try {
      const endpoint = `${apiUrlInput.replace(/\/+$/, '')}/classify-image`;
      const res = await fetch(endpoint, { method: 'OPTIONS' }).catch(() => null);
      if (res && res.status < 500) {
        setTestStatus({ success: true, message: `Connected! Backend returned status ${res.status}.` });
        showToast('Connection Succeeded', 'AI backend is reachable.', 'success');
      } else {
        setTestStatus({
          success: false,
          message: 'Could not connect to /classify-image. Check CORS headers and ensure service is running.'
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Connection failed. App will automatically use demo simulation mode.'
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all user settings, municipality rules, color theme, and language back to defaults?')) {
      resetToDefaults();
      setLanguage('en');
      setApiUrlInput('');
      localStorage.removeItem('smart_recycle_custom_api');
      showToast('Reset Complete', 'Settings restored to factory defaults.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-500" />
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. SEPARATE OPTION: 10 Regional Languages */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3>{t('settings.regionalLanguage')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {t('settings.regionalLanguageSub')}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              10 Languages
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  showToast('Language Selected', `Interface changed to ${lang.nativeName} (${lang.label})`, 'success');
                }}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-105 active:scale-95 ${
                  language === lang.code
                    ? `${currentColor.bgClass} text-white border-transparent ${currentColor.glowClass} font-bold`
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-400/40'
                }`}
              >
                <div className="text-lg mb-1">{lang.flag}</div>
                <div className="font-bold text-xs truncate">{lang.nativeName}</div>
                <div className="text-[10px] opacity-75 truncate">{lang.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. SEPARATE OPTION: Appearance Theme (Light / Dark / System) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3>{t('settings.appearanceTheme')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Choose between high-contrast dark obsidian or fresh daylight mode.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Dark Mode */}
            <button
              onClick={() => {
                setTheme('dark');
                showToast('Theme Changed', 'Switched to Dark Mode (#0B0F19)', 'info');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                settings.theme === 'dark'
                  ? 'bg-slate-900 text-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/40'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</div>
                <div className="text-[10px] text-gray-400">Deep slate #0B0F19</div>
              </div>
            </button>

            {/* Light Mode */}
            <button
              onClick={() => {
                setTheme('light');
                showToast('Theme Changed', 'Switched to Eco Light Mode', 'info');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                settings.theme === 'light'
                  ? 'bg-white text-slate-900 border-emerald-500 shadow-lg ring-2 ring-emerald-500/40'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</div>
                <div className="text-[10px] text-gray-500">Fresh daylight base</div>
              </div>
            </button>

            {/* System Preference */}
            <button
              onClick={() => {
                setTheme('system');
                showToast('Theme Changed', 'Synced with OS system preference', 'info');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                settings.theme === 'system'
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/40'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">System Preference</div>
                <div className="text-[10px] text-gray-400">Auto match OS</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. SEPARATE OPTION: Primary Color Accent Palette */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                <Palette className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <h3>{t('settings.colorTheme')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {t('settings.colorThemeSub')}
                </p>
              </div>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: currentColor.hex }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentColor.name}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = (settings.colorTheme || 'emerald') === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setColorTheme(preset.id);
                    showToast('Color Theme Changed', `Applied ${preset.name} accent palette!`, 'success');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${
                    isSelected
                      ? 'bg-white/10 dark:bg-white/10 border-white/40 shadow-lg ring-2'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-white/20'
                  }`}
                  style={isSelected ? { borderColor: preset.hex } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-800 dark:text-white truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400">
                      {preset.hex}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. SEPARATE OPTION: Supported Live Location & GPS Tracking */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Navigation className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3>{t('settings.liveLocationToggle')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Real-time GPS geolocation for calculating accurate distances to verified drop-off hubs.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supported</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-eco-border dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-gray-400 font-medium">Current Geolocation Status:</div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 flex items-center gap-2">
                <span>📍 {settings.municipality}</span>
                {settings.lastKnownCoords && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {settings.lastKnownCoords.lat.toFixed(3)}°N, {settings.lastKnownCoords.lng.toFixed(3)}°E
                  </span>
                )}
              </div>
            </div>

            <button
              disabled={isDetectingGps}
              onClick={handleDetectLiveLocation}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white ${currentColor.bgClass} hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 ${currentColor.glowClass}`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Acquiring GPS...' : t('dash.detectGps')}</span>
            </button>
          </div>
        </div>

        {/* 5. Municipal Policy & Measurement Units */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h3>{t('settings.municipalPolicy')}</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recycling rules vary across jurisdictions. Selecting your municipality tailors preparation
            advice (e.g. caps-on vs caps-off, plastics #1-7 vs #1-2 only).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Municipality
              </label>
              <select
                value={settings.municipality}
                onChange={(e) => {
                  updateSettings({ municipality: e.target.value });
                  showToast('Municipality Changed', `Sorting rules set for ${e.target.value}`, 'success');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-eco-border dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Bengaluru, KA">Bengaluru, KA (2-Bin 1-Bag Segregation & DWCC)</option>
                <option value="Mumbai, MH">Mumbai, MH (Dry/Wet Municipal Segregation)</option>
                <option value="Delhi NCR">Delhi NCR (Hazardous E-Waste & Plastic Rules)</option>
                <option value="Hyderabad, TS">Hyderabad, TS (GHMC Segregation Model)</option>
                <option value="Chennai, TN">Chennai, TN (Source Segregation Initiative)</option>
                <option value="San Francisco, CA">San Francisco, CA (Mandatory Composting & High Diversion)</option>
                <option value="New York, NY">New York, NY (Dual-Stream Curbside)</option>
                <option value="Seattle, WA">Seattle, WA (Organics Ban & Rigid Plastics)</option>
                <option value="London, UK">London, UK (Borough Mixed Dry Recycling)</option>
                <option value="Berlin, Germany">Berlin, Germany (Wertstofftonne & Duales System)</option>
                <option value="Tokyo, Japan">Tokyo, Japan (Burnable / Non-Burnable Strict Sorting)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('settings.measurementUnits')}
              </label>
              <select
                value={settings.unitSystem}
                onChange={(e) => {
                  updateSettings({ unitSystem: e.target.value as 'metric' | 'imperial' });
                  showToast('Unit System Updated', `Switched to ${e.target.value}`, 'info');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-eco-border dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="metric">Metric (kg, kilometers, liters)</option>
                <option value="imperial">Imperial (lbs, miles, gallons)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. AI Vision Endpoint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
              <Server className="w-5 h-5 text-emerald-500" />
              <h3>Custom AI Vision Endpoint</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              POST /classify-image
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="e.g. http://localhost:8000 or https://your-ai-service.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-eco-border dark:border-white/10 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSaveApi}
                className={`px-4 py-2.5 rounded-xl ${currentColor.bgClass} hover:opacity-90 text-white font-bold text-xs shrink-0`}
              >
                Save Endpoint
              </button>
              <button
                disabled={isTestingApi}
                onClick={handleTestConnection}
                className="px-3.5 py-2.5 rounded-xl border border-eco-border dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0"
              >
                {isTestingApi ? 'Pinging...' : 'Test Ping'}
              </button>
            </div>

            {testStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* 7. Factory Reset */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-eco-border dark:border-white/10 shadow-subtle flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Factory Reset</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Revert all themes, language, and custom storage to default</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('settings.resetDefaults')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
