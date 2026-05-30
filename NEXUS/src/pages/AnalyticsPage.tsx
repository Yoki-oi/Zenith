// src/pages/AnalyticsPage.tsx
import { useStore, subjectStats, globalStats, classStats } from '../store';
import { Subject } from '../types';

/* ── Ring Chart ────────────────────────────────────────────────── */
function Ring({ pct, color, size=88 }: { pct:number; color:string; size?:number }) {
  const r = (size-8)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray .8s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 6px ${color}88)` }} />
    </svg>
  );
}

/* ── Metric Card ───────────────────────────────────────────────── */
function MetricCard({ label, value, sub, color, icon }: { label:string; value:string|number; sub?:string; color:string; icon:string }) {
  return (
    <div className="rounded-xl p-4 sm:p-5 relative overflow-hidden"
      style={{
        background:'linear-gradient(140deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.015) 100%)',
        border:'1px solid var(--glass-border)',
        backdropFilter:'blur(16px)',
        transition:'transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .2s ease',
      }}
      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px) scale(1.02)'; el.style.boxShadow=`0 20px 55px rgba(0,0,0,0.5),0 0 0 1px ${color}30`; el.style.borderColor=color+'50'; }}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=''; el.style.borderColor='var(--glass-border)'; }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${color}88,transparent)` }} />
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-xs mono" style={{ color:'var(--t3)', letterSpacing:'1px', textTransform:'uppercase' }}>{label}</p>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <p className="hero-val text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color, fontFamily:'Space Grotesk', letterSpacing:'-1px' }}>{value}</p>
      {sub && <p className="text-xs mono" style={{ color:'var(--t3)' }}>{sub}</p>}
    </div>
  );
}

/* ── Insight Card ──────────────────────────────────────────────── */
function InsightCard({ icon, label, value, sub, color }: { icon:string; label:string; value:string; sub?:string; color:string }) {
  return (
    <div className="rounded-xl p-3 sm:p-4 flex items-center gap-3"
      style={{
        background:'rgba(255,255,255,0.03)',
        border:'1px solid var(--glass-border)',
        backdropFilter:'blur(12px)',
        transition:'transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .2s ease',
      }}
      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-3px) scale(1.01)'; el.style.boxShadow=`0 12px 36px rgba(0,0,0,0.4),0 0 0 1px ${color}25`; el.style.borderColor=color+'45'; }}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=''; el.style.borderColor='var(--glass-border)'; }}>
      <div className="text-xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mono mb-0.5" style={{ color:'var(--t3)', fontSize:9, textTransform:'uppercase', letterSpacing:'1px' }}>{label}</p>
        <p className="text-sm font-semibold truncate" style={{ color:'var(--t1)' }}>{value}</p>
        {sub && <p className="text-xs mono" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Subject Bar ───────────────────────────────────────────────── */
function SubjectBar({ s }: { s:Subject }) {
  const st = subjectStats(s);
  const openSubject = useStore(x=>x.openSubject);
  return (
    <div data-hover onClick={()=>openSubject(s.id, s.type==='chemistry'?'Physical':null)}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl"
      style={{
        background:'rgba(255,255,255,0.03)',
        border:'1px solid var(--glass-border)',
        cursor:'pointer',
        backdropFilter:'blur(12px)',
        transition:'transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .2s ease, background .2s ease',
      }}
      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-3px) scale(1.01)'; el.style.boxShadow=`0 12px 36px rgba(0,0,0,0.45),0 0 0 1px ${s.color}30`; el.style.borderColor=s.color+'45'; el.style.background=`${s.color}08`; }}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=''; el.style.borderColor='var(--glass-border)'; el.style.background='rgba(255,255,255,0.03)'; }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background:`${s.color}22`, color:s.color }}>{s.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color:'var(--t1)' }}>
            {s.name} <span className="font-normal" style={{ color:'var(--t3)' }}>· Cl{s.classNum}</span>
          </span>
          <span className="text-xs mono font-bold" style={{ color:s.color }}>{st.pct}%</span>
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-2" style={{ background:'rgba(255,255,255,0.06)' }}>
          <div style={{ flex:st.mastered, background:'var(--mastered)', transition:'flex .6s ease', minWidth:st.mastered?2:0 }} />
          <div style={{ flex:st.doing,    background:'var(--doing)',    transition:'flex .6s ease', minWidth:st.doing?2:0 }} />
          <div style={{ flex:Math.max(0,st.total-st.mastered-st.doing) }} />
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[{l:'Doing',v:st.doing,c:'var(--doing)'},{l:'Mastered',v:st.mastered,c:'var(--mastered)'},{l:'Revs',v:st.revTotal,c:'var(--revision)'}].map(chip=>(
            <div key={chip.l} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)' }}>
              <span className="text-xs font-bold mono" style={{ color:chip.c }}>{chip.v}</span>
              <span className="text-xs mono" style={{ color:'var(--t4)' }}>· {chip.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Flag Item ─────────────────────────────────────────────────── */
function FlagItem({ name, sub, color, badge, badgeCls }: { name:string; sub:string; color:string; badge:string; badgeCls:string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-150"
      style={{ background:'transparent', transition:'background .15s ease' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color:'var(--t2)' }}>{name}</p>
        <p className="text-xs mono" style={{ color:'var(--t3)' }}>{sub}</p>
      </div>
      <span className={`text-xs mono px-2 py-0.5 rounded-full shrink-0 ${badgeCls}`}>{badge}</span>
    </div>
  );
}

/* ── Class Card ────────────────────────────────────────────────── */
function ClassCard({ cls, st, color }: { cls:11|12; st:{ pct:number; total:number; doing:number; mastered:number; revTotal:number }; color:string }) {
  return (
    <div className="rounded-xl p-4 sm:p-6 relative overflow-hidden"
      style={{
        background:'linear-gradient(140deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.015) 100%)',
        border:'1px solid var(--glass-border)',
        backdropFilter:'blur(16px)',
        transition:'transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease',
      }}
      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow=`0 20px 55px rgba(0,0,0,0.5),0 0 0 1px ${color}25`; }}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=''; }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${color}88,transparent)` }} />
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <Ring pct={st.pct} color={color} size={80} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold mono" style={{ color }}>{st.pct}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-base mb-0.5" style={{ color:'var(--t1)' }}>Class {cls}</p>
          <p className="text-xs mono mb-3 sm:mb-4" style={{ color:'var(--t3)' }}>{st.total} chapters total</p>
          <div className="flex flex-wrap gap-2">
            {[{v:st.doing,l:'Doing',c:'var(--doing)'},{v:st.mastered,l:'Mastered',c:'var(--mastered)'},{v:st.revTotal,l:'Revisions',c:'var(--revision)'}].map(b=>(
              <div key={b.l} className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)' }}>
                <span className="text-sm font-bold mono" style={{ color:b.c }}>{b.v}</span>
                <span className="text-xs mono" style={{ color:'var(--t3)' }}>· {b.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Footer ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <div className="text-center py-8 mt-2" style={{ borderTop:'1px solid var(--line)' }}>
      <p className="font-bold text-sm mono mb-1" style={{ color:'var(--t3)', letterSpacing:'4px' }}>NEXUS</p>
      <p className="text-xs mono mb-3" style={{ color:'var(--t4)', letterSpacing:'2px' }}>TRACK · REVISE · CONQUER</p>
      <p className="text-xs mono" style={{ color:'var(--t4)' }}>
        crafted by <span style={{ color:'var(--accent)', fontWeight:600 }}>Yoki</span>
      </p>
    </div>
  );
}

/* ── AnalyticsPage ─────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const subjects = useStore(s => s.subjects);
  const gs  = globalStats(subjects);
  const c11 = classStats(subjects, 11);
  const c12 = classStats(subjects, 12);

  const weak:    { name:string; sub:string; color:string }[] = [];
  const needRev: { name:string; sub:string; color:string }[] = [];

  subjects.forEach(s => s.chapters.forEach(ch => {
    if (!ch.doing && !ch.mastered) weak.push({ name:ch.title, sub:`${s.name} · Cl${s.classNum}`, color:s.color });
    if (ch.doing && !ch.mastered && !(ch.revisions||0)) needRev.push({ name:ch.title, sub:`${s.name} · Cl${s.classNum}`, color:s.color });
  }));

  const topSubject   = [...subjects].sort((a,b)=>subjectStats(b).pct-subjectStats(a).pct)[0];
  const allChs       = subjects.flatMap(s=>s.chapters.map(c=>({...c, subName:s.name, color:s.color})));
  const mostRevised  = [...allChs].sort((a,b)=>(b.revisions||0)-(a.revisions||0))[0];
  const weakest      = allChs.filter(c=>!c.doing&&!c.mastered)[0];
  const doneCount    = allChs.filter(c=>c.mastered||c.doing).length;
  const trendPct     = allChs.length ? Math.round(doneCount/allChs.length*100) : 0;

  return (
    <div className="h-full overflow-y-auto page-enter" style={{ background:'transparent' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5" style={{ fontFamily:'Space Grotesk', letterSpacing:'-1px', color:'var(--t1)' }}>
            Analytics
          </h1>
          <p className="text-sm" style={{ color:'var(--t2)' }}>A full picture of your JEE preparation.</p>
        </div>

        {/* Global metrics — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          <MetricCard icon="🎯" label="Overall Score" value={`${gs.pct}%`}  sub={`${gs.scored}/${gs.total*2} pts`} color="var(--accent)" />
          <MetricCard icon="⚡" label="In Progress"   value={gs.doing}       sub={`of ${gs.total} chapters`}        color="var(--doing)" />
          <MetricCard icon="🏆" label="Mastered"      value={gs.mastered}    sub={`${gs.total?Math.round(gs.mastered/gs.total*100):0}% of syllabus`} color="var(--mastered)" />
          <MetricCard icon="🔄" label="Revisions"     value={gs.revTotal}    sub={`avg ${gs.total?(gs.revTotal/gs.total).toFixed(1):0}/ch`}           color="var(--revision)" />
        </div>

        {/* Insight cards — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <InsightCard icon="⭐" label="Top Subject"     value={topSubject?`${topSubject.name} ·${topSubject.classNum}`:'—'} sub={topSubject?`${subjectStats(topSubject).pct}% done`:''} color="var(--accent)" />
          <InsightCard icon="🔁" label="Most Revised"    value={mostRevised?mostRevised.title.slice(0,22):'None yet'}        sub={mostRevised?`${mostRevised.revisions}× revisions`:''}   color="var(--revision)" />
          <InsightCard icon="⚠️" label="Weakest Chapter" value={weakest?weakest.title.slice(0,22):'All started!'}            sub={weakest?weakest.subName:''}                             color="#f87171" />
          <InsightCard icon="📈" label="Completion"      value={`${trendPct}% active`}                                       sub={`${doneCount} of ${allChs.length} chapters`}            color="var(--mastered)" />
        </div>

        {/* Class breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <ClassCard cls={11} st={c11} color="var(--doing)" />
          <ClassCard cls={12} st={c12} color="var(--mastered)" />
        </div>

        {/* Subject breakdown */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold" style={{ color:'var(--t1)' }}>Subject Breakdown</h2>
            <div className="flex-1 h-px" style={{ background:'var(--line)' }} />
            <span className="hidden sm:inline text-xs mono" style={{ color:'var(--t3)' }}>click any subject to open tracker</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {subjects.map(s => <SubjectBar key={s.id} s={s} />)}
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="rounded-xl p-3 sm:p-4"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--glass-border)', backdropFilter:'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span>⚠️</span>
              <h3 className="text-sm font-semibold" style={{ color:'var(--t1)' }}>Weak Chapters</h3>
              <span className="text-xs mono ml-auto" style={{ color:'var(--t3)' }}>not started</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight:220 }}>
              {weak.length
                ? weak.map((f,i)=><FlagItem key={i} {...f} badge="not started" badgeCls="pill-doing" />)
                : <p className="text-xs mono py-4 text-center" style={{ color:'var(--t4)' }}>🎉 None! Great work.</p>}
            </div>
          </div>
          <div className="rounded-xl p-3 sm:p-4"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--glass-border)', backdropFilter:'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span>🔄</span>
              <h3 className="text-sm font-semibold" style={{ color:'var(--t1)' }}>Needs First Revision</h3>
              <span className="text-xs mono ml-auto" style={{ color:'var(--t3)' }}>0 revisions</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight:220 }}>
              {needRev.length
                ? needRev.map((f,i)=><FlagItem key={i} {...f} badge="revise now" badgeCls="pill-revision" />)
                : <p className="text-xs mono py-4 text-center" style={{ color:'var(--t4)' }}>✓ All revised!</p>}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
