import React, { useState } from 'react';
import { useAuth, StudentSignUpMeta } from '../../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BookOpen,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type AuthMode = 'login' | 'signup' | 'forgot-password';

interface AuthScreenProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    signInWithGoogle,
    continueAsGuest,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [college, setCollege] = useState('B.Tech Computer Science & Engineering');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState('Semester 1');
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setLocalError(null);
    setResetSent(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      onSuccess?.();
    } catch (err: any) {
      // mapped in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!displayName.trim()) {
      setLocalError('Please enter your full name or student display name.');
      return;
    }
    if (!email.trim() || !password) {
      setLocalError('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const meta: StudentSignUpMeta = {
        college: college.trim(),
        branch,
        semester,
        examDate,
      };
      await signUpWithEmail(email.trim(), password, displayName.trim(), meta);
      onSuccess?.();
    } catch (err: any) {
      // mapped in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim()) {
      setLocalError('Please enter your email address to receive the reset link.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (err: any) {
      // mapped in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      // mapped in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-900/40 mb-3">
            <div className="w-full h-full bg-[#0b101e] rounded-[14px] flex items-center justify-center font-mono font-bold text-white text-xl">
              C<span className="text-cyan-400 font-sans">AI</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight flex items-center justify-center gap-2">
            <span>C Tutor AI</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Your personal B.Tech engineering C programming mentor. Multi-user cloud learning with real GCC 12 compiler sandbox.
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-teal-400" /> Real GCC 12
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Cloud Sync
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> 16 C Topics & Quizzes
          </span>
        </div>

        {/* Auth Box */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#080d17] p-1 mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => switchMode('forgot-password')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'forgot-password'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Error Message */}
          {activeError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{activeError}</div>
            </div>
          )}

          {/* Reset Link Sent Success */}
          {resetSent && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                A password reset email has been sent to <strong className="text-white">{email}</strong>. Please check your inbox and spam folder.
              </div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Learning Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name / Display Name <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Email <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="CSE">CSE / IT</option>
                    <option value="ECE">ECE / EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="AI & DS">AI & Data Science</option>
                    <option value="Other">Other / Self-Learner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5+">Semester 5+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">College</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="College / Campus"
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Free Student Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered student email address. We will send a secure password reset link directly to your inbox.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || resetSent}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Optional Divider & Secondary Methods */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0d1424] px-2 text-slate-500">or</span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Optional Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2"
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

            {/* Guest / Preview Mode button */}
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full py-2 px-4 rounded-xl border border-dashed border-slate-700/60 bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Explore Curriculum in Guest / Preview Mode</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Independent per-student data isolation. Your code, notes, and quiz results are private.
        </p>
      </div>
    </div>
  );
};
