// src/pages/HomePage.tsx
import { useEffect, useRef, useState } from 'react';
import { useStore, subjectStats, globalStats, classStats } from '../store';
import { Subject } from '../types';

// ── Ambient Background Canvas ────────────────────────────────────────────────
function AmbientBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, raf = 0;

    const dots: { x: number; y: number; vx: number; vy: number; r: number; a: number; col: string }[] = [];
    const COLS = ['rgba(232,103,60,', 'rgba(56,189,248,', 'rgba(134,239,172,', 'rgba(192,132,252,'];

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      dots.length = 0;
      const n = Math.min(40, Math.floor((W * H) / 28000));
      for (let i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.4 + 0.4,
          a: Math.random() * 0.18 + 0.04,
          col: COLS[Math.floor(Math.random() * COLS.length)],
        });
      }
    };

    let tick = 0;
    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, W, H);

      // Faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 0.5;
      const gs = 72;
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Soft ambient glow blobs (very slow movement)
      const t = tick * 0.003;
      const blobs = [
        { cx: W * 0.15 + Math.sin(t * 0.7) * 60, cy: H * 0.2 + Math.cos(t * 0.5) * 40, col: 'rgba(232,103,60,0.04)', r: 280 },
        { cx: W * 0.85 + Math.cos(t * 0.6) * 50, cy: H * 0.7 + Math.sin(t * 0.8) * 35, col: 'rgba(56,189,248,0.03)', r: 240 },
        { cx: W * 0.5  + Math.sin(t * 0.4) * 80, cy: H * 0.9 + Math.cos(t * 0.3) * 20, col: 'rgba(192,132,252,0.025)', r: 200 },
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r);
        g.addColorStop(0, b.col);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2); ctx.fill();
      });

      // Floating particles
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.col + d.a + ')';
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);
    resize(); init(); draw();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

// ── Countdown Widget ─────────────────────────────────────────────────────────
function Countdown() {
  const stored = localStorage.getItem('nexus-countdown');
  const def = { title: 'JEE Main 2027', date: '2027-01-20' };
  const [cfg, setCfg] = useState<{ title: string; date: string }>(stored ? JSON.parse(stored) : def);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cfg);
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(cfg.date).getTime() - Date.now();
      setDays(Math.max(0, Math.ceil(diff / 86400000)));
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [cfg]);

  const save = () => {
    setCfg(draft);
    localStorage.setItem('nexus-countdown', JSON.stringify(draft));
    setEditing(false);
  };

  if (editing) return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--line2)',
      borderRadius: 12, padding: '10px 14px', minWidth: 200,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <input autoFocus value={draft.title}
        onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
        className="w-full text-xs mb-2 px-2 py-1 rounded"
        style={{ background: 'var(--bg5)', border: '1px solid var(--line)', color: 'var(--t1)' }}
        placeholder="Title…" />
      <input type="date" value={draft.date}
        onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
        className="w-full text-xs mb-3 px-2 py-1 rounded"
        style={{ background: 'var(--bg5)', border: '1px solid var(--line)', color: 'var(--t1)' }} />
      <div className="flex gap-2">
        <button onClick={save} data-hover
          className="flex-1 text-xs py-1 rounded font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}>Save</button>
        <button onClick={() => setEditing(false)} data-hover
          className="text-xs px-2 py-1 rounded"
          style={{ color: 'var(--t3)', border: '1px solid var(--line)' }}>✕</button>
      </div>
    </div>
  );

  return (
    <button data-hover onClick={() => { setDraft(cfg); setEditing(true); }}
      className="flex items-center gap-2.5 transition-all duration-200"
      style={{
        background: 'var(--bg3)', border: '1px solid var(--line)',
        borderRadius: 12, padding: '7px 13px',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'}>
      <span style={{ fontSize: 14 }}>⏳</span>
      <div className="text-left">
        <p className="text-xs font-semibold" style={{ color: 'var(--t1)', lineHeight: 1.2 }}>{cfg.title}</p>
        <p className="mono" style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700 }}>{days} days left</p>
      </div>
    </button>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-6 shimmer-card transition-all duration-300"
      style={{ background: 'var(--bg2)', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)`; el.style.borderColor = 'var(--line2)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = 'var(--line)'; }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: color, opacity: 0.5 }} />
      <p className="text-xs mono mb-2.5" style={{ color: 'var(--t3)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</p>
      <p className="text-4xl font-bold tracking-tight" style={{ color, fontFamily: 'Space Grotesk', letterSpacing: '-1.5px' }}>{value}</p>
      {sub && <p className="text-xs mt-2" style={{ color: 'var(--t3)' }}>{sub}</p>}
      <div className="mt-4 h-px" style={{ background: color, opacity: 0.2 }} />
    </div>
  );
}

// ── Subject Card ─────────────────────────────────────────────────────────────
function SubjectCard({ s, onClick }: { s: Subject; onClick: () => void }) {
  const st = subjectStats(s);
  const [hovered, setHovered] = useState(false);

  // Top 3 chapter names for hover reveal
  const recentChs = s.chapters
    .filter(c => c.doing || c.mastered)
    .slice(0, 3)
    .map(c => c.title);
  const fallbackChs = s.chapters.slice(0, 3).map(c => c.title);
  const showChs = recentChs.length ? recentChs : fallbackChs;

  return (
    <div onClick={onClick} data-hover
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-5 shimmer-card"
      style={{
        background: 'var(--bg2)', border: `1px solid ${hovered ? s.color + '40' : 'var(--line)'}`,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-4px) scale(1.015)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.45), 0 0 20px ${s.color}18` : 'none',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.2s ease',
      }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: s.color, opacity: hovered ? 0.9 : 0.5, transition: 'opacity 0.2s' }} />

      {/* Glow on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 130, height: 130,
          borderRadius: '50%', background: s.color,
          filter: 'blur(55px)', opacity: 0.08, pointerEvents: 'none',
        }} />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: s.color + '20', color: s.color, transition: 'transform 0.2s', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
            {s.icon}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--t1)' }}>{s.name}</p>
            <p className="text-xs mono mt-0.5" style={{ color: 'var(--t3)' }}>Class {s.classNum} · {st.total} ch</p>
          </div>
        </div>
        <span className="text-sm font-bold mono" style={{ color: s.color }}>{st.pct}%</span>
      </div>

      {/* Mini progress bars */}
      <div className="flex flex-col gap-2 mb-3">
        {[
          { label: 'Doing',    val: st.doing,    total: st.total, color: 'var(--doing)' },
          { label: 'Mastered', val: st.mastered,  total: st.total, color: 'var(--mastered)' },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <p className="text-xs mono w-14 shrink-0" style={{ color: 'var(--t3)' }}>{b.label}</p>
            <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg5)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: b.total ? `${b.val / b.total * 100}%` : '0%', background: b.color }} />
            </div>
            <p className="text-xs mono w-5 text-right shrink-0" style={{ color: 'var(--t3)' }}>{b.val}</p>
          </div>
        ))}
      </div>

      {/* Hover: chapter list */}
      <div style={{
        maxHeight: hovered ? 72 : 0, opacity: hovered ? 1 : 0,
        overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.25s ease',
      }}>
        <div className="pt-2" style={{ borderTop: '1px solid var(--line)' }}>
          <p className="text-xs mono mb-1.5" style={{ color: 'var(--t4)', letterSpacing: '0.6px', textTransform: 'uppercase', fontSize: 9 }}>
            {recentChs.length ? 'Active chapters' : 'Latest chapters'}
          </p>
          {showChs.map((title, i) => (
            <p key={i} className="text-xs truncate" style={{ color: 'var(--t2)', lineHeight: 1.7 }}>
              <span style={{ color: s.color, marginRight: 6 }}>·</span>{title}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const subjects   = useStore((s) => s.subjects);
  const user       = useStore((s) => s.user);
  const openSubject = useStore((s) => s.openSubject);
  const gs  = globalStats(subjects);
  const c11 = classStats(subjects, 11);
  const c12 = classStats(subjects, 12);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg0)', position: 'relative' }}>
      {/* Ambient canvas background */}
      <AmbientBg />

      <div className="max-w-5xl mx-auto px-8 py-10" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header row */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs mono mb-2" style={{ color: 'var(--t3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Ranker'} 👋
            </p>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>
              Your <span style={{ background: 'linear-gradient(90deg, var(--accent), #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Command Center</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--t2)' }}>Track every chapter. Revise smart. Ace the exam.</p>
          </div>
          <div className="shrink-0 mt-1">
            <Countdown />
          </div>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <StatCard label="Overall Score" value={`${gs.pct}%`}   color="var(--accent)"   sub={`${gs.scored} / ${gs.total * 2} pts`} />
          <StatCard label="In Progress"   value={gs.doing}        color="var(--doing)"    sub="chapters being studied" />
          <StatCard label="Mastered"      value={gs.mastered}     color="var(--mastered)" sub={`${gs.total ? Math.round(gs.mastered/gs.total*100) : 0}% of syllabus`} />
          <StatCard label="Revisions"     value={gs.revTotal}     color="var(--revision)" sub={`avg ${gs.total ? (gs.revTotal/gs.total).toFixed(1) : 0} per chapter`} />
        </div>

        {/* Class 11 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xs font-bold mono tracking-widest" style={{ color: 'var(--t3)', letterSpacing: '2.5px' }}>CLASS XI COMMAND GRID</h2>
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            <span className="text-xs mono" style={{ color: 'var(--t3)' }}>{c11.pct}% done · {c11.total} chapters</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {subjects.filter(s => s.classNum === 11).map(s => (
              <SubjectCard key={s.id} s={s} onClick={() => openSubject(s.id, s.type === 'chemistry' ? 'Physical' : null)} />
            ))}
          </div>
        </div>

        {/* Class 12 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xs font-bold mono tracking-widest" style={{ color: 'var(--t3)', letterSpacing: '2.5px' }}>CLASS XII COMMAND GRID</h2>
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            <span className="text-xs mono" style={{ color: 'var(--t3)' }}>{c12.pct}% done · {c12.total} chapters</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {subjects.filter(s => s.classNum === 12).map(s => (
              <SubjectCard key={s.id} s={s} onClick={() => openSubject(s.id, s.type === 'chemistry' ? 'Physical' : null)} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-6">
          <p className="font-bold text-sm tracking-widest mono mb-1" style={{ color: 'var(--t2)', letterSpacing: '3px' }}>NEXUS OS</p>
          <p className="text-xs mono mb-2" style={{ color: 'var(--t4)', letterSpacing: '1.5px' }}>TRACK  ·  REVISE  ·  CONQUER</p>
          <p className="text-xs mono" style={{ color: 'var(--t4)' }}>
            crafted by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Yoki</span>
          </p>
        </div>
      </div>
    </div>
  );
}
