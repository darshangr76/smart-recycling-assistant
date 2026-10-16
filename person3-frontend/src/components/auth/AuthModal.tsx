import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithUsername,
    signupWithUsername,
    logout
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      showToast('Signed in with Google', 'Connected as Alex Rivera (alex.rivera.eco@gmail.com)', 'success');
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }

    if (activeTab === 'signup' && !email.trim()) {
      setErrorMessage('Please provide an email address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'signin') {
        const res = await loginWithUsername(username, password);
        if (res.success) {
          showToast('Authentication Successful', res.message, 'success');
          closeAuthModal();
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await signupWithUsername(username, email, password);
        if (res.success) {
          showToast('Account Created', res.message, 'success');
          closeAuthModal();
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('demo2026');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#0D1117] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 230, 118, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Neon accent top glow bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E676] to-transparent" />

        {/* Ambient subtle glow blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#00E676]/10 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated && user ? (
          /* User is already signed in — Profile Card */
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-2">
              <div className="relative inline-block mx-auto">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name || 'User'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#00E676] shadow-lg shadow-[#00E676]/20 mx-auto"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#00E676] rounded-full border-2 border-[#0D1117] flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">{user.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user.email || '@user'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Eco Status</span>
                <p className="text-sm font-bold text-[#00E676] flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reward Wallet</span>
                <p className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  420 pts
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={closeAuthModal}
                className="w-full py-3 px-4 rounded-xl bg-[#00E676] text-black font-bold text-sm hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#00E676]/25"
              >
                Continue to Dashboard
              </button>
              <button
                onClick={async () => {
                  await logout();
                  showToast('Signed Out', 'You have been signed out of your profile.', 'info');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-rose-400 hover:text-rose-300 border border-white/[0.06] font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch Profile</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/25 text-[#00E676] text-[11px] font-bold tracking-wide mb-1">
                <Sparkles className="w-3 h-3" />
                Smart Recycling Identity
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {activeTab === 'signin' ? 'Sign in to SmartRecycle' : 'Create Eco Account'}
              </h2>
              <p className="text-xs text-slate-400">
                Track sorting analytics, IoT bins, and earn verified eco-rewards.
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#0D1117] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Or with username
              </span>
              <div className="border-t border-white/[0.08] w-full" />
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'signin'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex_eco"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                  />
                </div>
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Demo Presets for Hackathon Judges */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-500">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('alex_eco')}
                  className="px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-[#00E676] border border-white/[0.05] transition-colors"
                >
                  @alex_eco
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('sarah_green')}
                  className="px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-cyan-400 border border-white/[0.05] transition-colors"
                >
                  @sarah_green
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00E676] text-black font-bold text-sm hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{activeTab === 'signin' ? 'Sign In with Username' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
