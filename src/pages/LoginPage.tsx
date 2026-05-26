// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useStore } from '../store';

export default function LoginPage() {
  const setUser = useStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const continueAsGuest = () => {
    setUser({ name: 'Guest', email: 'guest@local' });
  };

  const googleSignIn = async () => {
    setLoading(true);
    // Firebase would go here. For now → guest mode with a note
    setTimeout(() => {
      alert('To enable Google Sign-in, add your Firebase config in src/pages/LoginPage.tsx.\nFor now, continuing as Guest.');
      continueAsGuest();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg0)' }}>

      {/* Grid */}
      <div className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
        }} />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed" style={{ top: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,103,60,0.07) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <div className="pointer-events-none fixed" style={{ bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm px-6"
        style={{ animation: 'pageIn 0.6s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, #e8673c, #f472b6)', boxShadow: '0 0 32px rgba(232,103,60,0.35)' }}>
              ⚡
            </div>
            <div className="absolute inset-0 rounded-2xl border border-orange-400 opacity-30 scale-110"
              style={{ animation: 'ringPulse 3s ease-in-out infinite' }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-2px' }}>
              NEXUS
            </h1>
            <p className="text-xs tracking-widest mt-1 mono" style={{ color: 'var(--t3)', letterSpacing: '3px' }}>
              JEE COMMAND CENTER
            </p>
          </div>
          <p className="text-sm mt-1 leading-relaxed text-center" style={{ color: 'var(--t2)', maxWidth: 260 }}>
            Your complete JEE preparation tracker. Every chapter. Every revision. One place.
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl p-px overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl p-7 flex flex-col gap-4" style={{ background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(20px)' }}>

            {/* Google */}
            <button
              onClick={googleSignIn}
              disabled={loading}
              data-hover
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200"
              style={{
                border: '1px solid var(--line2)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--t1)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,103,60,0.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(232,103,60,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--t3)', borderTopColor: 'var(--accent)' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>{loading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
              <span className="text-xs mono" style={{ color: 'var(--t3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            </div>

            {/* Guest */}
            <button
              onClick={continueAsGuest}
              data-hover
              className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ border: '1px solid var(--line)', color: 'var(--t2)', background: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; (e.currentTarget as HTMLElement).style.color = 'var(--t1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--t2)'; }}
            >
              👤 Continue as Guest
            </button>

            <p className="text-center text-xs mono" style={{ color: 'var(--t3)' }}>
              Guest data is saved locally in your browser
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {['📊 Analytics', '⚡ Chapter Tracking', '🔄 Revision Counter', '🏆 JEE Syllabus'].map((f) => (
            <span key={f} className="text-xs mono" style={{ color: 'var(--t3)' }}>{f}</span>
          ))}
        </div>

        {/* Credits */}
        <p className="text-xs mono" style={{ color: 'var(--t4)' }}>
          crafted with obsession by <span style={{ color: 'var(--accent)' }}>yoki</span>
        </p>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%, 100% { opacity: 0.3; transform: scale(1.05); }
          50% { opacity: 0.6; transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
