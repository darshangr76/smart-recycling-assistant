import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, Wallet, MapPin, Sparkles } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1117]/90 backdrop-blur-2xl border-t border-white/[0.08] px-4 py-2 sm:py-2.5 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      {/* 1. Home Dashboard */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
            isActive
              ? 'text-[#00E676] font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              <LayoutDashboard className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_#00E676]' : ''}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Home Dashboard</span>
          </>
        )}
      </NavLink>

      {/* 2. AI Scanner — Hero Futuristic Center Action */}
      <NavLink
        to="/scanner"
        className={({ isActive }) =>
          `flex flex-col items-center -mt-5 group transition-transform ${
            isActive ? 'scale-105' : 'hover:scale-102 active:scale-95'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-black font-bold transition-all duration-300 relative ${
                isActive
                  ? 'bg-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.6)] border-2 border-white'
                  : 'bg-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.35)] border border-[#00E676]/50'
              }`}
            >
              <ScanLine className="w-6 h-6 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-black animate-pulse" />
            </div>
            <span
              className={`text-[10px] font-bold tracking-tight mt-1 ${
                isActive ? 'text-[#00E676]' : 'text-slate-300'
              }`}
            >
              Scanner
            </span>
          </>
        )}
      </NavLink>

      {/* 3. Eco-Rewards Wallet */}
      <NavLink
        to="/rewards"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
            isActive
              ? 'text-[#00E676] font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              <Wallet className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_#00E676]' : ''}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Eco-Rewards Wallet</span>
          </>
        )}
      </NavLink>

      {/* 4. Depot Map */}
      <NavLink
        to="/centers"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
            isActive
              ? 'text-[#00E676] font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              <MapPin className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_#00E676]' : ''}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Depot Map</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};
