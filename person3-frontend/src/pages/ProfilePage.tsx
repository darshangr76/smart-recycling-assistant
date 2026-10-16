import React, { useState, useEffect } from 'react';
import {
  Mail,
  Shield,
  Download,
  Trash2,
  LogOut,
  History,
} from 'lucide-react';
import { AuthService, SupabaseAuthUser, isSupabaseConfigured } from '../services/supabaseClient';
import { ImpactService, RecordedScanEvent } from '../services/impactService';
import { RewardService } from '../services/rewardService';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [history, setHistory] = useState<RecordedScanEvent[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const profileRewards = RewardService.getProfile();

  useEffect(() => {
    AuthService.getCurrentUser().then(setUser);
    setHistory(ImpactService.getHistory());
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsLoggingIn(true);
    const res = await AuthService.signInWithEmail(emailInput);
    setIsLoggingIn(false);
    if (res.success) {
      showToast('Logged In', res.message, 'success');
      AuthService.getCurrentUser().then(setUser);
    } else {
      showToast('Login Failed', res.message, 'error');
    }
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
    setUser(null);
    showToast('Signed Out', 'Switched to guest session.', 'info');
  };

  const exportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smart-recycle-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export Complete', 'Downloaded personal sustainability record.', 'success');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local scan history?')) {
      ImpactService.clearHistory();
      setHistory([]);
      showToast('History Cleared', 'Local records have been reset.', 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Profile & History
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Manage your account credentials, view audit logs, and export your personal diversion data.
        </p>
      </div>

      <div className="glass-card p-7 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400/20"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {user?.name || 'Alex Rivera'}
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  Lvl {profileRewards.level} {profileRewards.levelTitle}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'alex.eco@greenmail.org'}</span>
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>Member since Oct 2026</span>
                <span className="text-white/20">•</span>
                <span className="text-emerald-400 font-semibold">{profileRewards.points} points</span>
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : null}
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Supabase Status:</span>
            <span className={`font-semibold ${isSupabaseConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isSupabaseConfigured ? 'Connected (Cloud RLS Sync)' : 'Offline Local Storage Demo'}
            </span>
          </div>

          {!user && (
            <form onSubmit={handleSignIn} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="px-3 py-2 rounded-lg border border-white/10 text-xs bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isLoggingIn}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors"
              >
                Sign In
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Personal Scan Audit Records Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Personal Scan Records</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {history.length} events
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete chronological audit trail of your scanned items and diversion impact.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-xs font-semibold text-rose-300 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Audit Table / List */}
        <div className="space-y-2.5">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    {item.itemName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {item.itemName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                      <span className="font-medium text-emerald-400">{item.category}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      item.recyclable
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.recyclable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{item.recyclable ? 'Diverted' : 'Landfill / Other'}</span>
                  </span>
                  <div className="text-xs font-mono text-slate-400">
                    {item.weightKg} kg {item.co2SavedKg > 0 && <span className="text-emerald-400/90 font-medium">(-{item.co2SavedKg} kg CO₂)</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-14 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 text-sm text-slate-400">
              No scan history found. Try scanning items in the AI Scanner!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
