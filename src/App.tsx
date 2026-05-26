import Cursor from './components/Cursor'
import { useStore } from './store'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SubjectPage from './pages/SubjectPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
  const page = useStore((s) => s.page)

  const renderPage = () => {
    switch (page) {
      case 'login':     return <LoginPage />
      case 'home':      return <HomePage />
      case 'subject':   return <SubjectPage />
      case 'analytics': return <AnalyticsPage />
      default:          return <LoginPage />
    }
  }

  return (
    <>
      <Cursor />

      {page !== 'login' && <NavBar />}

      <div
        key={page}
        className="page-enter"
        style={{
          height: page !== 'login' ? 'calc(100vh - 52px)' : '100vh',
          marginTop: page !== 'login' ? 52 : 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderPage()}
      </div>
    </>
  )
}

/* ── NavBar ──────────────────────────────────────────────────────────────── */
function NavBar() {
  const { page, setPage, user, logout, subjects } = useStore()

  const totalChs = subjects.reduce((a, s) => a + s.chapters.length, 0)
  const doneChs = subjects.reduce(
    (a, s) => a + s.chapters.filter((c) => c.mastered || c.doing).length,
    0,
  )
  const pct = totalChs ? Math.round((doneChs / totalChs) * 100) : 0

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6"
      style={{
        height: 52,
        background: 'rgba(6,6,8,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* Brand */}
      <button
        data-hover
        onClick={() => setPage('home')}
        className="flex items-center gap-2 shrink-0"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg,#e8673c,#f472b6)',
            boxShadow: '0 0 10px rgba(232,103,60,0.3)',
          }}
        >
          ⚡
        </div>
        <span
          className="font-bold text-sm"
          style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}
        >
          NEXUS
        </span>
      </button>

      <div className="w-px h-4" style={{ background: 'var(--line)' }} />

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {(
          [
            { label: 'Dashboard', p: 'home' },
            { label: 'Analytics', p: 'analytics' },
          ] as const
        ).map(({ label, p }) => (
          <button
            key={p}
            data-hover
            onClick={() => setPage(p)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              color: page === p ? 'var(--t1)' : 'var(--t3)',
              background: page === p ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (page !== p)
                (e.currentTarget as HTMLElement).style.color = 'var(--t2)'
            }}
            onMouseLeave={(e) => {
              if (page !== p)
                (e.currentTarget as HTMLElement).style.color = 'var(--t3)'
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Progress pill */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{ background: 'var(--bg3)', border: '1px solid var(--line)' }}
      >
        <div
          className="w-16 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--bg5)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg,var(--doing),var(--mastered))',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <span
          className="text-xs mono font-bold"
          style={{ color: 'var(--accent)' }}
        >
          {pct}%
        </span>
      </div>

      <div className="w-px h-4" style={{ background: 'var(--line)' }} />

      {/* User / logout */}
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg,var(--accent),#c084fc)',
            color: '#fff',
          }}
        >
          {(user?.name?.[0] ?? 'G').toUpperCase()}
        </div>
        <span className="text-xs" style={{ color: 'var(--t2)' }}>
          {user?.name ?? 'Guest'}
        </span>
        <button
          data-hover
          onClick={logout}
          className="text-xs px-2 py-1 rounded-lg transition-all duration-150"
          style={{ color: 'var(--t3)', border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = '#f87171'
            ;(e.currentTarget as HTMLElement).style.borderColor =
              'rgba(248,113,113,0.2)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--t3)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
          }}
          title="Sign out"
        >
          ↩
        </button>
      </div>
    </header>
  )
}
