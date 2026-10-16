import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Recycle,
  Radio,
  Wifi,
  BatteryCharging,
  Cpu,
  LogIn,
  ShieldCheck,
  Globe,
  Check,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { LocationService } from '../../services/locationService';
import { useSettings } from '../../context/SettingsContext';

export const Header: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { language, setLanguage, languages } = useLanguage();
  const { showToast } = useToast();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [isIotTooltipOpen, setIsIotTooltipOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [liveCity, setLiveCity] = useState<string>(settings.lastKnownCoords?.city || settings.municipality);
  const iotMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iotMenuRef.current && !iotMenuRef.current.contains(event.target as Node)) {
        setIsIotTooltipOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectLocation = async () => {
    setIsLocating(true);
    showToast('Detecting GPS', 'Acquiring satellite geolocation coordinates...', 'info');

    const pos = await LocationService.getUserPosition();
    setIsLocating(false);

    if (pos) {
      setLiveCity(pos.cityName);
      updateSettings({
        municipality: pos.cityName,
        lastKnownCoords: { lat: pos.lat, lng: pos.lng, city: pos.cityName }
      });
      showToast('Live Location Locked', `${pos.cityName}`, 'success');
    } else {
      showToast('GPS Permission Required', 'Allow browser location access in address bar.', 'error');
    }
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0D1117]/90 backdrop-blur-xl border-b border-white/[0.08] px-3.5 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left Side: Brand Icon & Dynamic IoT Connection Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <NavLink to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-[#00E676] flex items-center justify-center text-black shadow-lg shadow-[#00E676]/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden lg:inline brand-text">
              Smart<span className="text-[#00E676]">Recycle</span>
            </span>
          </NavLink>

          {/* Dynamic IoT Connection Indicator Badge */}
          <div className="relative" ref={iotMenuRef}>
            <button
              onClick={() => setIsIotTooltipOpen(!isIotTooltipOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-[#00E676]/35 text-xs text-slate-200 transition-all active:scale-98 group"
              title="Click to view IoT SmartBin telemetry"
            >
              {/* Pulsing neon ping dot */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676] shadow-[0_0_8px_#00E676]" />
              </span>

              <Radio className="w-3 h-3 text-[#00E676] animate-pulse shrink-0" />
              <span className="font-semibold tracking-tight text-white text-[11px] sm:text-xs whitespace-nowrap">
                SmartBin <span className="font-mono text-[#00E676]">#04</span> Connected
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/20 desktop-only" />
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline desktop-only">12ms</span>
            </button>

            {/* IoT Telemetry Dropdown */}
            {isIotTooltipOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0D1117] border border-white/[0.12] p-4 shadow-2xl z-50 text-xs space-y-3 backdrop-blur-2xl animate-slide-in">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#00E676]" />
                    <span className="font-bold text-white">SmartBin Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                    LIVE MQTT
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Node ID:</span>
                    <span className="font-mono text-white font-semibold">SBIN-04-SECTOR7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ultrasonic Fill Level:</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#00E676]">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[42%] h-full bg-[#00E676] rounded-full" />
                      </div>
                      <span>42%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lid Optical Sensor:</span>
                    <span className="text-white">Active (Auto-lock ready)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#00E676]" /> Battery:
                    </span>
                    <span className="font-mono text-white">94% (Solar trickle)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Signal RSSI:
                    </span>
                    <span className="font-mono text-cyan-300">-58 dBm (Strong)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsIotTooltipOpen(false);
                    showToast('SmartBin Synced', 'Transferred local telemetry session to Bin #04.', 'success');
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#00E676]/15 text-[#00E676] hover:bg-[#00E676]/25 border border-[#00E676]/30 font-semibold text-[11px] transition-colors"
                >
                  Test Bin Lid Actuator
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Desktop Location/Language + User Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Desktop GPS (Hidden on small viewports to prevent clutter) */}
          <button
            onClick={handleDetectLocation}
            className="hidden lg:flex desktop-only items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs text-slate-300 transition-all"
            title="Refresh GPS location"
          >
            <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin text-[#00E676]' : 'text-[#00E676]'}`} />
            <span className="max-w-[100px] truncate text-white">{liveCity}</span>
          </button>

          {/* Desktop Language Selector */}
          <div className="relative hidden md:block desktop-only" ref={langMenuRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="text-sm leading-none">{currentLangObj.flag}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-52 max-h-72 overflow-y-auto rounded-2xl bg-[#0D1117] border border-white/[0.12] shadow-2xl p-1.5 z-50 backdrop-blur-2xl">
                <div className="space-y-0.5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                        language === lang.code ? 'bg-[#00E676] text-black font-bold' : 'text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Authentication Modal Trigger */}
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#00E676]/40 transition-all group shrink-0"
            title={isAuthenticated ? `Profile: ${user?.name}. Click to view or switch.` : 'Sign in with Google or Username'}
          >
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#00E676]/60 group-hover:ring-[#00E676] transition-all"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
                  <LogIn className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#00E676] border-2 border-[#0D1117] rounded-full" />
            </div>

            <div className="hidden sm:flex desktop-only flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight max-w-[90px] truncate">
                {isAuthenticated ? user?.name : 'Sign In'}
              </span>
              <span className="text-[10px] text-[#00E676] font-semibold leading-tight flex items-center gap-0.5">
                {isAuthenticated ? <><ShieldCheck className="w-2.5 h-2.5" /> Verified</> : 'Google / User'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
