'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0d14] relative overflow-hidden px-4">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative flex flex-col items-center gap-6 text-center">
        {/* Logo */}
        <img src="/logo.png" alt="Zenith" className="w-16 h-16 rounded-2xl mb-2" />

        {/* 404 */}
        <div>
          <p className="text-[96px] font-bold text-white/10 leading-none select-none" style={{ letterSpacing: '-4px' }}>404</p>
          <h1 className="text-white text-2xl font-semibold -mt-4 mb-2">Page not found</h1>
          <p className="text-gray-500 text-sm max-w-xs">
            Looks like this page took a wrong turn. Let's get you back on track.
          </p>
        </div>

        {/* Back home button */}
        <a
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
        >
          ← Back to Zenith
        </a>

        <p className="text-gray-700 text-xs mt-2">nexus-jee.vercel.app</p>
      </div>
    </div>
  );
}
