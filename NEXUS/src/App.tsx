// src/App.tsx
import { useStore } from './store';
import LoginPage    from './pages/LoginPage';
import HomePage     from './pages/HomePage';
import SubjectPage  from './pages/SubjectPage';
import AnalyticsPage from './pages/AnalyticsPage';

/* Ambient background rendered once, behind everything */
function AmbientBg() {
  return (
    <div className="nexus-bg">
      <div className="nexus-bg-grid" />
      <div className="nexus-bg-orb orb-1" />
      <div className="nexus-bg-orb orb-2" />
      <div className="nexus-bg-orb orb-3" />
    </div>
  );
}

export default function App() {
  const page = useStore(s => s.page);

  const renderPage = () => {
    switch (page) {
      case 'login':     return <LoginPage />;
      case 'home':      return <HomePage />;
      case 'subject':   return <SubjectPage />;
      case 'analytics': return <AnalyticsPage />;
      default:          return <LoginPage />;
    }
  };

  return (
    <>
      <AmbientBg />
      {page !== 'login' && <NavBar />}
      <div
        key={page}
        className="page-enter nexus-layer"
        style={{
          height:    page !== 'login' ? 'calc(100dvh - var(--nav-h))' : '100dvh',
          marginTop: page !== 'login' ? 'var(--nav-h)' : 0,
          overflow:  'hidden',
          display:   'flex',
          flexDirection: 'column',
        }}
      >
        {renderPage()}
      </div>
    </>
  );
}

/* ── NavBar ──────────────────────────────────────────────────────── */
function NavBar() {
  const { page, setPage, user, logout, subjects } = useStore();

  const total    = subjects.reduce((a, s) => a + s.chapters.length, 0);
  const done     = subjects.reduce((a, s) => a + s.chapters.filter(c => c.mastered || c.doing).length, 0);
  const pct      = total ? Math.round(done / total * 100) : 0;
  const mastered = subjects.reduce((a, s) => a + s.chapters.filter(c => c.mastered).length, 0);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 sm:gap-3 px-3 sm:px-5"
      style={{
        height: 'var(--nav-h)',
        background: 'rgba(8,11,20,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      {/* Brand */}
      <button data-hover onClick={() => setPage('home')} className="flex items-center gap-2 shrink-0 mr-1 sm:mr-2">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#e8673c,#f472b6)', boxShadow: '0 0 14px rgba(232,103,60,0.35)' }}>
          ⚡
        </div>
        {/* Hide brand text on very small screens */}
        <span className="font-bold text-sm tracking-tight hidden sm:inline"
          style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.5px', color: 'var(--t1)' }}>
          NEXUS
        </span>
      </button>

      {/* Nav tabs */}
      <nav className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
        {([{ label: 'Dashboard', p: 'home' }, { label: 'Analytics', p: 'analytics' }] as const).map(({ label, p }) => (
          <button key={p} data-hover onClick={() => setPage(p)}
            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              color:      page === p ? 'var(--t1)' : 'var(--t3)',
              background: page === p ? 'rgba(255,255,255,0.08)' : 'transparent',
              boxShadow:  page === p ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Mastered chip — hidden on small screens */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.18)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--mastered)' }} />
        <span className="text-xs mono font-bold" style={{ color: 'var(--mastered)' }}>{mastered}</span>
        <span className="text-xs mono" style={{ color: 'var(--t3)' }}>mastered</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
        <div className="w-14 sm:w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--doing),var(--accent))' }} />
        </div>
        <span className="text-xs mono font-bold" style={{ color: 'var(--accent)' }}>{pct}%</span>
      </div>

      <div className="hidden sm:block" style={{ width: 1, height: 20, background: 'var(--line)' }} />

      {/* User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,var(--accent),#c084fc)', color: '#fff' }}>
          {(user?.name?.[0] ?? 'G').toUpperCase()}
        </div>
        <span className="hidden md:inline text-xs font-medium" style={{ color: 'var(--t2)' }}>{user?.name ?? 'Guest'}</span>
        <button data-hover onClick={logout}
          className="text-xs px-1.5 sm:px-2 py-1 rounded-lg transition-all duration-150 mono"
          style={{ color: 'var(--t3)', border: '1px solid transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#f87171'; (e.currentTarget as HTMLElement).style.borderColor='rgba(248,113,113,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--t3)'; (e.currentTarget as HTMLElement).style.borderColor='transparent'; }}
          title="Sign out">↩</button>
      </div>
    </header>
  );
}
