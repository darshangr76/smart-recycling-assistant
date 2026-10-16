import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, AppWindow, Wifi, Battery, Sparkles } from 'lucide-react';

export type DeviceMode = 'android' | 'ios' | 'window' | 'responsive';

interface DeviceFrameProps {
  children: React.ReactNode;
  activeMode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
}

export const DeviceFrameContainer: React.FC<DeviceFrameProps> = ({
  children,
  activeMode,
  onModeChange
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Floating frame switcher controller
  const FrameController = (
    <div className="fixed top-3 right-4 z-50 flex items-center gap-1.5 p-1 rounded-2xl bg-[#0D1117]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl">
      <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[#00E676]" />
        <span className="hidden sm:inline">Frame:</span>
      </div>

      {/* Android Phone Option */}
      <button
        onClick={() => onModeChange('android')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          activeMode === 'android'
            ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/30'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
        }`}
        title="View in Google Pixel / Samsung Galaxy Android phone frame"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Android</span>
      </button>

      {/* iOS Phone Option */}
      <button
        onClick={() => onModeChange('ios')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          activeMode === 'ios'
            ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/30'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
        }`}
        title="View in iPhone 16 Pro iOS smartphone frame"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>iOS Phone</span>
      </button>

      {/* macOS Window Option */}
      <button
        onClick={() => onModeChange('window')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          activeMode === 'window'
            ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/30'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
        }`}
        title="View in macOS / Windows application desktop frame"
      >
        <AppWindow className="w-3.5 h-3.5" />
        <span>macOS</span>
      </button>

      {/* Full Responsive Canvas Option */}
      <button
        onClick={() => onModeChange('responsive')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          activeMode === 'responsive'
            ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/30'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
        }`}
        title="View in full adaptive responsive layout"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Full Canvas</span>
      </button>
    </div>
  );

  if (activeMode === 'responsive') {
    return (
      <>
        {FrameController}
        <div className="w-full min-h-screen bg-[#0D1117] text-slate-100">
          {children}
        </div>
      </>
    );
  }

  if (activeMode === 'window') {
    return (
      <div className="min-h-screen w-full bg-[#080B10] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 relative">
        {FrameController}

        {/* macOS Window Frame */}
        <div className="w-full max-w-6xl h-[92vh] max-h-[960px] rounded-2xl bg-[#0D1117] border border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col overflow-hidden relative backdrop-blur-2xl">
          {/* macOS Titlebar */}
          <div className="h-10 bg-[#090D14] border-b border-white/[0.06] flex items-center justify-between px-4 select-none shrink-0">
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
            </div>

            {/* Window Title */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span>Smart Recycling Assistant — Desktop Edition</span>
            </div>

            <div className="w-14" />
          </div>

          {/* Window Body */}
          <div className="flex-1 overflow-y-auto relative">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'android') {
    // Android Phone Frame (Google Pixel 9 / Samsung Galaxy S24)
    return (
      <div className="min-h-screen w-full bg-[#080B10] flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden">
        {FrameController}

        {/* Android Hardware Shell */}
        <div className="relative w-[392px] h-[840px] max-h-[calc(100vh-2rem)] rounded-[46px] bg-[#000000] p-3 shadow-[0_0_60px_rgba(0,230,118,0.2),0_30px_90px_rgba(0,0,0,0.95)] border-[3px] border-[#2E3440] ring-1 ring-white/10 flex flex-col overflow-hidden">
          {/* Edge Bezel */}
          <div className="absolute inset-0 rounded-[43px] pointer-events-none border border-white/5" />

          {/* Screen Display Area */}
          <div
            className="relative w-full h-full rounded-[38px] bg-[#0D1117] overflow-hidden flex flex-col text-slate-100 frame-phone"
            style={{ transform: 'translate3d(0, 0, 0)', contain: 'paint' }}
          >
            {/* Android Material 3 Status Bar */}
            <div className="h-10 bg-transparent px-6 flex items-center justify-between text-xs text-white/90 select-none z-30 shrink-0">
              {/* Left: Clock */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium tracking-tight">{currentTime}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              </div>

              {/* Centered Android Selfie Punch-Hole Camera */}
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700/80 mx-auto -mt-1 shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              {/* Right: 5G, Wi-Fi, Android Battery Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white/80">5G</span>
                <Wifi className="w-3.5 h-3.5 text-white/90" />
                <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-[#00E676]">
                  <span>98%</span>
                </div>
              </div>
            </div>

            {/* Scrollable Android App Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col scrollbar-none">
              {children}
            </div>

            {/* Android Modern Gesture Navigation Pill */}
            <div className="h-5 w-full flex items-center justify-center shrink-0 z-50 bg-[#0D1117] pointer-events-none">
              <div className="w-24 h-1 rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS Smartphone Frame Mode (iPhone 16 Pro)
  return (
    <div className="min-h-screen w-full bg-[#080B10] flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden">
      {FrameController}

      {/* Realistic iPhone 16 Pro Hardware Shell */}
      <div className="relative w-[393px] h-[852px] max-h-[calc(100vh-2rem)] rounded-[55px] bg-[#000000] p-3 shadow-[0_0_60px_rgba(0,230,118,0.2),0_30px_90px_rgba(0,0,0,0.95)] border-[4px] border-[#2A2F38] ring-1 ring-white/10 flex flex-col overflow-hidden">
        {/* Subtle Titanium Edge Highlights */}
        <div className="absolute inset-0 rounded-[51px] pointer-events-none border border-white/10" />

        {/* Screen Bezel Area */}
        <div
          className="relative w-full h-full rounded-[44px] bg-[#0D1117] overflow-hidden flex flex-col text-slate-100 frame-phone"
          style={{ transform: 'translate3d(0, 0, 0)', contain: 'paint' }}
        >
          {/* iOS 18 Top Status Bar */}
          <div className="h-11 bg-transparent px-7 flex items-center justify-between text-xs text-white font-semibold select-none z-30 shrink-0">
            {/* Time */}
            <span className="tracking-tight text-[13px] font-bold">{currentTime}</span>

            {/* Dynamic Island */}
            <div className="h-7 w-28 bg-black rounded-full flex items-center justify-between px-2.5 mx-auto -mt-1 shadow-md border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span className="text-[9px] font-mono text-[#00E676] font-bold tracking-tight">IoT #04</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>

            {/* Cellular, WiFi, Battery */}
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-[#00E676]" />
            </div>
          </div>

          {/* App Scrollable Content Area inside Smartphone Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col scrollbar-none">
            {children}
          </div>

          {/* iOS Home Indicator Swipe Bar */}
          <div className="h-5 w-full flex items-center justify-center shrink-0 z-50 bg-[#0D1117] pointer-events-none">
            <div className="w-32 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
