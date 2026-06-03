'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, BarChart3, Target, TrendingUp } from 'lucide-react';

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  const switchMode = (m: Mode) => { reset(); setMode(m); };

  // ── Google ────────────────────────────────────────────────────────────────

  const handleGoogle = async () => {
    reset();
    try {
      setLoading(true);
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') setError('Google sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Login ────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.trim()) { setError('Enter your email.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later or reset your password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ───────────────────────────────────────────────────────────────

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (!email.trim()) { setError('Enter your email.'); return; }
    if (!password) { setError('Enter a password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      // onAuthStateChanged in page.tsx handles navigation
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try logging in.');
      } else if (code === 'auth/invalid-email') {
        setError('Enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ───────────────────────────────────────────────────────

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.trim()) { setError('Enter your email address.'); return; }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('Reset email sent! Check your inbox.');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError('Failed to send reset email. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0c13]">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-white/8 shadow-2xl">

        {/* ── Left Panel ── */}
        <div className="hidden md:flex flex-col w-5/12 p-10 relative overflow-hidden bg-[#0d1018]">
          <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none">
            <svg viewBox="0 0 400 220" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
                </linearGradient>
                <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d="M0,80 C60,40 120,120 180,80 C240,40 300,120 360,80 C390,60 400,70 400,70 L400,220 L0,220 Z" fill="url(#wg1)" />
              <path d="M0,120 C60,90 120,150 180,120 C240,90 300,150 360,120 C390,105 400,110 400,110 L400,220 L0,220 Z" fill="url(#wg2)" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="font-nexus text-4xl text-white mb-3">Nexus</h1>
            <div className="w-10 h-0.5 bg-purple-500 rounded mb-5" />
            <p className="text-gray-400 text-base leading-relaxed">
              Syllabus Tracking Platform<br />for JEE Aspirants
            </p>
          </div>
          <div className="h-10" />
          <div className="relative z-10 space-y-5 pb-56">
            <FeatureItem icon={<BarChart3 className="w-5 h-5 text-blue-400" />} title="Track Progress" desc="Monitor your syllabus completion across all subjects." />
            <FeatureItem icon={<Target className="w-5 h-5 text-purple-400" />} title="Stay Focused" desc="Keep your focus on what matters most for JEE." />
            <FeatureItem icon={<TrendingUp className="w-5 h-5 text-green-400" />} title="Sync Everywhere" desc="Your data syncs across all your devices in real time." />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="w-full md:w-7/12 bg-[#0f1219] flex flex-col justify-center p-10">
          <div className="max-w-sm mx-auto w-full">

            {/* Back button for signup / forgot */}
            {mode !== 'login' && (
              <button
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {mode === 'login' && 'Login to continue your preparation'}
              {mode === 'signup' && 'Sign up to start tracking your JEE prep'}
              {mode === 'forgot' && "We'll send a reset link to your email"}
            </p>

            {/* Error / Success banners */}
            {error && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {mode === 'login' && (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field label="Email Address" icon={<Mail className="w-4 h-4" />}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); reset(); }}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Password" icon={<Lock className="w-4 h-4" />}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); reset(); }}
                      placeholder="Enter your password"
                      className={inputCls + ' pr-12'}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className={submitCls}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <Divider />
                <GoogleButton onClick={handleGoogle} loading={loading} />

                <p className="text-center text-sm text-gray-500 mt-8">
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('signup')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Create one
                  </button>
                </p>
              </>
            )}

            {/* ── SIGN UP FORM ── */}
            {mode === 'signup' && (
              <>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Field label="Your Name" icon={<User className="w-4 h-4" />}>
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); reset(); }}
                      placeholder="Enter your name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email Address" icon={<Mail className="w-4 h-4" />}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); reset(); }}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Password" icon={<Lock className="w-4 h-4" />}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); reset(); }}
                      placeholder="At least 6 characters"
                      className={inputCls + ' pr-12'}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>
                  <Field label="Confirm Password" icon={<Lock className="w-4 h-4" />}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); reset(); }}
                      placeholder="Repeat your password"
                      className={inputCls + ' pr-12'}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>
                  <button type="submit" disabled={loading} className={submitCls}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                <Divider />
                <GoogleButton onClick={handleGoogle} loading={loading} />

                <p className="text-center text-sm text-gray-500 mt-8">
                  Already have an account?{' '}
                  <button onClick={() => switchMode('login')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Login
                  </button>
                </p>
              </>
            )}

            {/* ── FORGOT PASSWORD FORM ── */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4">
                <Field label="Email Address" icon={<Mail className="w-4 h-4" />}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); reset(); }}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>
                <button type="submit" disabled={loading || !!success} className={submitCls}>
                  {loading ? 'Sending...' : success ? 'Email Sent ✓' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-gray-700 mt-8">Your data is stored securely in your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const inputCls = "w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all";
const submitCls = "w-full py-3.5 bg-[#3730a3] hover:bg-[#4338ca] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-1";

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-xs text-gray-600">or continue with</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 bg-[#1a1f2e] hover:bg-[#1f2640] border border-white/8 rounded-xl transition-all disabled:opacity-50 text-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <span className="text-white font-medium">Continue with Google</span>
    </button>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-white font-medium text-sm mb-0.5">{title}</p>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
