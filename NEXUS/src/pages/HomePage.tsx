// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useStore, subjectStats, globalStats, classStats } from '../store';
import { Subject } from '../types';

/* ── Countdown ─────────────────────────────────────────────────── */
function Countdown() {
  const stored = localStorage.getItem('nexus-countdown');
  const def = { title: 'JEE Main 2027', date: '2027-01-20' };
  const [cfg, setCfg] = useState<{ title: string; date: string }>(stored ? JSON.parse(stored) : def);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cfg);
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calc = () => setDays(Math.max(0, Math.ceil((new Date(cfg.date).getTime() - Date.now()) / 86400000)));
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [cfg]);

  const save = () => { setCfg(draft); localStorage.setItem('nexus-countdown', JSON.stringify(draft)); setEditing(false); };

  if (editing) return (
    <div className="rounded-xl p-4 w-60" style={{ background:'var(--bg3)', border:'1px solid var(--glass-border-bright)', boxShadow:'0 12px 40px rgba(0,0,0,0.5)' }}>
      <input autoFocus value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
        className="w-full text-xs px-2 py-1.5 rounded-lg mb-2" placeholder="Title…"
        style={{ background:'var(--bg5)', border:'1px solid var(--glass-border)', color:'var(--t1)' }} />
      <input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
        className="w-full text-xs px-2 py-1.5 rounded-lg mb-3"
        style={{ background:'var(--bg5)', border:'1px solid var(--glass-border)', color:'var(--t1)' }} />
      <div className="flex gap-2">
        <button data-hover onClick={save} className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
          style={{ background:'var(--accent)', color:'#fff' }}>Save</button>
        <button data-hover onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ color:'var(--t3)', border:'1px solid var(--glass-border)' }}>✕</button>
      </div>
    </div>
  );

  return (
    <button data-hover onClick={() => { setDraft(cfg); setEditing(true); }}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--glass-border)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent-border)'; (e.currentTarget as HTMLElement).style.background='rgba(232,103,60,0.05)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--glass-border)'; (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; }}>
      <div className="text-2xl font-bold mono" style={{ color:'var(--accent)', lineHeight:1 }}>{days}</div>
      <div className="text-left">
        <p className="text-xs font-semibold" style={{ color:'var(--t1)' }}>{cfg.title}</p>
        <p className="text-xs mono" style={{ color:'var(--t3)' }}>days remaining</p>
      </div>
    </button>
  );
}

/* ── Big Stat Card ─────────────────────────────────────────────── */
function HeroCard({ label, value, sub, color, icon }: { label:string; value:string|number; sub?:string; color:string; icon:string }) {
  return (
    <div className="rounded-xl p-4 sm:p-5 relative overflow-hidden card-lift"
      style={{ background:'linear-gradient(140deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.015) 100%)', border:'1px solid var(--glass-border)', backdropFilter:'blur(16px)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${color}88,transparent)` }} />
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-xs mono" style={{ color:'var(--t3)', letterSpacing:'1px', textTransform:'uppercase' }}>{label}</p>
        <span className="text-base sm:text-lg">{icon}</span>
      </div>
      <p className="hero-val text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color, fontFamily:'Space Grotesk', letterSpacing:'-1px' }}>{value}</p>
      {sub && <p className="text-xs mono" style={{ color:'var(--t3)' }}>{sub}</p>}
    </div>
  );
}

/* ── Subject Card ──────────────────────────────────────────────── */
function SubjectCard({ s, onClick }: { s: Subject; onClick: () => void }) {
  const st = subjectStats(s);
  const [hovered, setHovered] = useState(false);
  const activeChs = s.chapters.filter(c => c.doing || c.mastered).slice(0, 3).map(c => c.title);
  const showChs   = activeChs.length ? activeChs : s.chapters.slice(0, 3).map(c => c.title);

  return (
    <div data-hover onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: hovered
          ? `linear-gradient(140deg,${s.color}12 0%,rgba(255,255,255,0.03) 100%)`
          : 'linear-gradient(140deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.015) 100%)',
        border: `1px solid ${hovered ? s.color+'45' : 'var(--glass-border)'}`,
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 20px 55px rgba(0,0,0,0.5),0 0 0 1px ${s.color}30` : '0 4px 20px rgba(0,0,0,0.25)',
        transition: 'transform .25s cubic-bezier(.16,1,.3,1),box-shadow .25s ease,border-color .2s ease,background .2s ease',
        backdropFilter: 'blur(16px)',
      }}>

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${s.color}${hovered?'cc':'55'},transparent)`, transition:'opacity .2s' }} />

      {/* Glow blob */}
      {hovered && (
        <div style={{ position:'absolute', top:-50, right:-50, width:160, height:160, borderRadius:'50%',
          background:s.color, filter:'blur(65px)', opacity:.07, pointerEvents:'none' }} />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background:`${s.color}22`, color:s.color, transition:'transform .2s', transform: hovered?'scale(1.1)':'scale(1)' }}>
            {s.icon}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color:'var(--t1)' }}>{s.name}</p>
            <p className="text-xs mono mt-0.5" style={{ color:'var(--t3)' }}>Class {s.classNum} · {st.total} ch</p>
          </div>
        </div>
        <span className="text-sm font-bold mono" style={{ color:s.color }}>{st.pct}%</span>
      </div>

      {/* Stacked bars */}
      <div className="mb-3 flex flex-col gap-1.5">
        {[
          { label:'Doing',    val:st.doing,   total:st.total, color:'var(--doing)' },
          { label:'Mastered', val:st.mastered, total:st.total, color:'var(--mastered)' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-xs mono w-14 shrink-0" style={{ color:'var(--t3)' }}>{b.label}</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: b.total ? `${b.val/b.total*100}%` : '0%', background:b.color }} />
            </div>
            <span className="text-xs mono w-4 text-right shrink-0" style={{ color:'var(--t3)' }}>{b.val}</span>
          </div>
        ))}
      </div>

      {/* Chapter reveal */}
      <div style={{ maxHeight:hovered?80:0, opacity:hovered?1:0, overflow:'hidden', transition:'max-height .3s ease,opacity .25s ease' }}>
        <div className="pt-2" style={{ borderTop:'1px solid var(--line)' }}>
          <p className="text-xs mono mb-1" style={{ color:'var(--t4)', fontSize:9, letterSpacing:'0.8px', textTransform:'uppercase' }}>
            {activeChs.length ? 'Active chapters' : 'Latest chapters'}
          </p>
          {showChs.map((title, i) => (
            <p key={i} className="text-xs truncate" style={{ color:'var(--t2)', lineHeight:1.8 }}>
              <span style={{ color:s.color, marginRight:6 }}>·</span>{title}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Footer ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <div className="text-center py-8 mt-4" style={{ borderTop:'1px solid var(--line)' }}>
      <p className="font-bold text-sm mono mb-1" style={{ color:'var(--t3)', letterSpacing:'4px' }}>NEXUS</p>
      <p className="text-xs mono mb-3" style={{ color:'var(--t4)', letterSpacing:'2px' }}>TRACK · REVISE · CONQUER</p>
      <p className="text-xs mono" style={{ color:'var(--t4)' }}>
        crafted by <span style={{ color:'var(--accent)', fontWeight:600 }}>Yoki</span>
      </p>
    </div>
  );
}

/* ── HomePage ──────────────────────────────────────────────────── */
export default function HomePage() {
  const subjects    = useStore(s => s.subjects);
  const user        = useStore(s => s.user);
  const openSubject = useStore(s => s.openSubject);

  const gs  = globalStats(subjects);
  const c11 = classStats(subjects, 11);
  const c12 = classStats(subjects, 12);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="h-full overflow-y-auto" style={{ background:'transparent' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 sm:mb-8 flex-wrap gap-3 sm:gap-4">
          <div>
            <p className="text-xs mono mb-1.5" style={{ color:'var(--t3)', letterSpacing:'2px', textTransform:'uppercase' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Ranker'} 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily:'Space Grotesk', letterSpacing:'-1px', color:'var(--t1)' }}>
              Your{' '}
              <span style={{ background:'linear-gradient(90deg,var(--accent),var(--pink))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Command Center
              </span>
            </h1>
            <p className="text-sm" style={{ color:'var(--t2)' }}>Track every chapter. Revise smart. Ace the exam.</p>
          </div>
          <Countdown />
        </div>

        {/* Hero stats — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <HeroCard label="Overall Score" value={`${gs.pct}%`}  sub={`${gs.scored}/${gs.total*2} pts`} color="var(--accent)"   icon="🎯" />
          <HeroCard label="In Progress"   value={gs.doing}       sub="chapters active"                  color="var(--doing)"    icon="⚡" />
          <HeroCard label="Mastered"      value={gs.mastered}    sub={`${gs.total?Math.round(gs.mastered/gs.total*100):0}% of syllabus`} color="var(--mastered)" icon="🏆" />
          <HeroCard label="Revisions"     value={gs.revTotal}    sub={`avg ${gs.total?(gs.revTotal/gs.total).toFixed(1):0}/ch`}          color="var(--revision)" icon="🔄" />
        </div>

        {/* Completion overview bar */}
        <div className="rounded-xl p-4 sm:p-5 mb-6 sm:mb-8"
          style={{ background:'linear-gradient(140deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.015) 100%)', border:'1px solid var(--glass-border)', backdropFilter:'blur(16px)' }}>
          <div className="flex items-start sm:items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold" style={{ color:'var(--t1)' }}>Overall Completion</p>
              <p className="text-xs mono" style={{ color:'var(--t3)' }}>{gs.total} chapters total across all subjects</p>
            </div>
            <div className="overview-pcts flex items-center gap-4">
              {[
                { label:'Class XI',  val:`${c11.pct}%`, color:'var(--doing)' },
                { label:'Class XII', val:`${c12.pct}%`, color:'var(--mastered)' },
              ].map(b => (
                <div key={b.label} className="text-right">
                  <p className="text-lg font-bold mono" style={{ color:b.color }}>{b.val}</p>
                  <p className="text-xs mono" style={{ color:'var(--t3)' }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Segment bar */}
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background:'rgba(255,255,255,0.06)' }}>
            <div style={{ flex:gs.mastered, background:'var(--mastered)', transition:'flex .8s ease', minWidth:gs.mastered?2:0 }} />
            <div style={{ flex:gs.doing,    background:'var(--doing)',    transition:'flex .8s ease', minWidth:gs.doing?2:0 }} />
            <div style={{ flex:Math.max(0, gs.total - gs.mastered - gs.doing) }} />
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-3">
            {[
              { label:'Mastered', color:'var(--mastered)', val:gs.mastered },
              { label:'In Progress', color:'var(--doing)', val:gs.doing },
              { label:'Not Started', color:'var(--t4)', val:Math.max(0,gs.total-gs.mastered-gs.doing) },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background:l.color }} />
                <span className="text-xs mono" style={{ color:'var(--t3)' }}>{l.val} {l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Class XI */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background:'var(--doing)' }} />
              <h2 className="text-xs font-bold mono" style={{ color:'var(--t2)', letterSpacing:'2px', textTransform:'uppercase' }}>Class XI</h2>
            </div>
            <div className="flex-1 h-px" style={{ background:'var(--line)' }} />
            <span className="text-xs mono" style={{ color:'var(--t3)' }}>{c11.pct}% · {c11.total} chapters</span>
          </div>
          {/* 1-col on mobile, 2-col on sm, 3-col on md+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {subjects.filter(s => s.classNum === 11).map(s => (
              <SubjectCard key={s.id} s={s} onClick={() => openSubject(s.id, s.type==='chemistry'?'Physical':null)} />
            ))}
          </div>
        </div>

        {/* Class XII */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background:'var(--mastered)' }} />
              <h2 className="text-xs font-bold mono" style={{ color:'var(--t2)', letterSpacing:'2px', textTransform:'uppercase' }}>Class XII</h2>
            </div>
            <div className="flex-1 h-px" style={{ background:'var(--line)' }} />
            <span className="text-xs mono" style={{ color:'var(--t3)' }}>{c12.pct}% · {c12.total} chapters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {subjects.filter(s => s.classNum === 12).map(s => (
              <SubjectCard key={s.id} s={s} onClick={() => openSubject(s.id, s.type==='chemistry'?'Physical':null)} />
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
