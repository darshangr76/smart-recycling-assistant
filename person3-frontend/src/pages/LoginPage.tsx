import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Recycle,
  Sparkles,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Cpu,
  KeyRound,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithUsername, signupWithUsername, isAuthenticated, user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password verification criteria calculations
  const criteria = useMemo(() => {
    return {
      minLen: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      matches: mode === 'signup' ? password.length > 0 && password === confirmPassword : true
    };
  }, [password, confirmPassword, mode]);

  // Overall password strength calculation (0 to 100)
  const { score, label, color, barClass } = useMemo(() => {
    if (!password) return { score: 0, label: 'Enter password', color: '#64748b', barClass: 'w-0 bg-slate-600' };
    let s = 0;
    if (criteria.minLen) s += 25;
    if (criteria.hasUpper) s += 25;
    if (criteria.hasNumber) s += 25;
    if (criteria.hasSpecial) s += 25;

    if (s <= 25) return { score: 25, label: 'Weak (Vulnerable)', color: '#ef4444', barClass: 'w-1/4 bg-rose-500' };
    if (s <= 50) return { score: 50, label: 'Fair (Add numbers/symbols)', color: '#f59e0b', barClass: 'w-2/4 bg-amber-500' };
    if (s <= 75) return { score: 75, label: 'Strong (Secure)', color: '#06b6d4', barClass: 'w-3/4 bg-cyan-400' };
    return { score: 100, label: 'Verified Military-Grade Shield', color: '#00E676', barClass: 'w-full bg-[#00E676]' };
  }, [password, criteria]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      showToast('Verified Google Login', 'Welcome Alex Rivera (alex.rivera.eco@gmail.com)', 'success');
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter a username');
      return;
    }

    if (mode === 'signup') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      if (!criteria.minLen || !criteria.hasNumber) {
        setErrorMsg('Password does not meet required security criteria');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signupWithUsername(username, email, password);
        if (res.success) {
          showToast('Account Created & Verified', res.message, 'success');
          navigate('/');
        } else {
          setErrorMsg(res.message);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration failed');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In mode
      setIsSubmitting(true);
      try {
        const res = await loginWithUsername(username, password);
        if (res.success) {
          showToast('Authentication Verified', res.message, 'success');
          navigate('/');
        } else {
          setErrorMsg(res.message);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Sign in failed');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleQuickPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    if (mode === 'signup') setConfirmPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-xl bg-[#0D1117] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,230,118,0.08)] relative overflow-hidden backdrop-blur-2xl">
        {/* Neon top hairline accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E676] to-transparent" />

        {/* Ambient radial glow blobs */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#00E676]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#00E676]/30 text-xs font-semibold text-[#00E676] mb-2 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span>SmartRecycle Verified Security</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to Your Eco Hub' : 'Create Verified Eco Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Access IoT SmartBins, multi-material AI scanning, and verified municipal recycling rewards.
          </p>
        </div>

        {/* Already Authenticated Banner */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-[#00E676]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00E676]"
              />
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Currently logged in as {user.name}</span>
                  <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">Active</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 rounded-xl bg-[#00E676] text-black text-xs font-bold hover:brightness-110 transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 text-xs font-semibold border border-white/10 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50 group mb-5"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full font-mono ml-auto hidden sm:inline">
            OAuth 2.0
          </span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#0D1117] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Or with Verified Password
          </span>
          <div className="border-t border-white/[0.08] w-full" />
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
              />
            </div>
          </div>

          {/* Email (Signup only) */}
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
              </div>
            </div>
          )}

          {/* Password with Verified Security Inspector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              {password && (
                <span className="text-[10px] font-bold font-mono" style={{ color }}>
                  {label}
                </span>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter strong password"
                required
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Progress Bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${barClass}`} />
                </div>
              </div>
            )}

            {/* Live Password Verification Criteria Checklist */}
            {password && (
              <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] grid grid-cols-2 gap-2 text-[11px] animate-fade-in">
                <div className={`flex items-center gap-1.5 ${criteria.minLen ? 'text-[#00E676]' : 'text-slate-500'}`}>
                  {criteria.minLen ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-[#00E676]' : 'text-slate-500'}`}>
                  {criteria.hasUpper ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-[#00E676]' : 'text-slate-500'}`}>
                  {criteria.hasNumber ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasSpecial ? 'text-[#00E676]' : 'text-slate-500'}`}>
                  {criteria.hasSpecial ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                  <span>Special symbol (!@#)</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${criteria.matches ? 'text-[#00E676]' : 'text-amber-400'}`}>
                    {criteria.matches ? 'Passwords Match ✓' : 'Does Not Match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-white/5 border border-white/10 text-[#00E676] focus:ring-0"
              />
              <span>Remember this session</span>
            </label>

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => showToast('Password Recovery', 'Demo instructions sent to your linked address.', 'info')}
                className="text-slate-400 hover:text-[#00E676] transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>

          {/* Quick-fill Demo Presets for Hackathon Judges */}
          <div className="pt-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Demo Accounts:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickPreset('alex_eco', 'EcoShield2026!')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-[#00E676] border border-[#00E676]/30 transition-colors"
              >
                @alex_eco
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('sarah_green', 'GreenPlanet99#')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-cyan-400 border border-cyan-500/30 transition-colors"
              >
                @sarah_green
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('judge_demo', 'JudgeReview123$')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-amber-400 border border-amber-500/30 transition-colors"
              >
                @judge_demo
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#00E676] text-black font-extrabold text-sm hover:brightness-110 active:scale-98 transition-all shadow-[0_0_25px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Verify & Access Dashboard' : 'Complete Verified Registration'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
          <span>•</span>
          <span className="text-slate-500">End-to-End Cryptographic Security</span>
        </div>
      </div>
    </div>
  );
};
