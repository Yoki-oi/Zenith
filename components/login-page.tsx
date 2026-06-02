'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Mail, Lock, Eye, EyeOff, BarChart3, Target, TrendingUp, User } from 'lucide-react';

export default function LoginPage() {
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !password) return;
    setLoading(true);
    setTimeout(() => {
      setUser({ name: name.trim() || 'User', email: email || 'user@example.com' });
      setLoading(false);
    }, 600);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({ name: name.trim() || 'User', email: 'user@gmail.com' });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0c13]">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-white/8 shadow-2xl">

        {/* ── Left Panel: Branding ── */}
        <div className="hidden md:flex flex-col w-5/12 p-10 relative overflow-hidden bg-[#0d1018]">
          {/* Wave SVG background */}
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none">
            <svg
              viewBox="0 0 400 220"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
                </linearGradient>
                <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              {/* Back wave */}
              <path
                d="M0,80 C60,40 120,120 180,80 C240,40 300,120 360,80 C390,60 400,70 400,70 L400,220 L0,220 Z"
                fill="url(#wg1)"
              />
              {/* Front wave */}
              <path
                d="M0,120 C60,90 120,150 180,120 C240,90 300,150 360,120 C390,105 400,110 400,110 L400,220 L0,220 Z"
                fill="url(#wg2)"
              />
            </svg>
          </div>

          {/* Top: Logo + tagline */}
          <div className="relative z-10">
            <h1 className="font-nexus text-4xl text-white mb-3">Nexus</h1>
            <div className="w-10 h-0.5 bg-purple-500 rounded mb-5" />
            <p className="text-gray-400 text-base leading-relaxed">
              Syllabus Tracking Platform
              <br />
              for JEE Aspirants
            </p>
          </div>

          {/* Spacer */}
          <div className="h-10" />

          {/* Middle: Feature list */}
          <div className="relative z-10 space-y-5 pb-52">
            <FeatureItem
              icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
              title="Track Progress"
              desc="Monitor your syllabus completion and stay on track."
            />
            <FeatureItem
              icon={<Target className="w-5 h-5 text-purple-400" />}
              title="Stay Focused"
              desc="Keep your focus on what matters the most."
            />
            <FeatureItem
              icon={<TrendingUp className="w-5 h-5 text-green-400" />}
              title="Achieve Goals"
              desc="Analyze your performance and achieve your target."
            />
          </div>
        </div>

        {/* ── Right Panel: Login Form ── */}
        <div className="w-full md:w-7/12 p-10 bg-[#0f1219]">
          <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-8">Login to continue your journey</p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#3730a3] hover:bg-[#4338ca] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-gray-500">or continue with</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Google only */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#1a1f2e] hover:bg-[#1f2640] border border-white/8 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {/* Google G */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-white font-medium">Google</span>
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Don&apos;t have an account?{' '}
              <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white font-medium text-sm mb-0.5">{title}</p>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
