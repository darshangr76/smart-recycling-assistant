import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { TechGridBackground } from './TechGridBackground';
import { NeonCursor } from '../effects/NeonCursor';
import { FloatingAiAssistantPanel } from '../assistant/FloatingAiAssistantPanel';
import { AuthModal } from '../auth/AuthModal';
import { DeviceFrameContainer, DeviceMode } from './DeviceFrameSwitcher';

export const AppLayout: React.FC = () => {
  // Default to iOS Smartphone frame concept if on desktop, or load saved preference
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    const saved = localStorage.getItem('smart_recycle_device_mode') as DeviceMode;
    return saved || 'responsive';
  });

  const handleDeviceModeChange = (mode: DeviceMode) => {
    setDeviceMode(mode);
    localStorage.setItem('smart_recycle_device_mode', mode);
  };

  return (
    <DeviceFrameContainer activeMode={deviceMode} onModeChange={handleDeviceModeChange}>
      <div className="min-h-screen bg-[#0D1117] text-slate-100 flex flex-col lg:flex-row transition-colors duration-200 relative overflow-x-hidden">
        {/* Custom Neon Cursor with Particle Field */}
        <NeonCursor />

        {/* Cinematic Tech-Grid Ambient Background */}
        <TechGridBackground />

        {/* Desktop Sidebar (Only shown in full desktop responsive mode or macOS window) */}
        {deviceMode !== 'ios' && deviceMode !== 'android' && (
          <div className="hidden lg:block shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <Header />

          <main
            className={`flex-1 w-full mx-auto animate-fade-in ${
              deviceMode === 'ios' || deviceMode === 'android'
                ? 'p-4 pb-24 max-w-md'
                : 'p-4 sm:p-6 lg:p-8 max-w-7xl pb-28 lg:pb-16'
            }`}
          >
            <Outlet />
          </main>

          {/* Futuristic Bottom Navigation (Shown in phone modes AND on mobile viewports) */}
          <div className={deviceMode === 'ios' || deviceMode === 'android' ? 'block' : 'lg:hidden'}>
            <MobileNav />
          </div>
        </div>

        {/* Floating AI Assistant Drawer */}
        <FloatingAiAssistantPanel />

        {/* Universal Google & Username Auth Modal */}
        <AuthModal />
      </div>
    </DeviceFrameContainer>
  );
};
