// src/pages/AnalyticsPage.tsx
import { useStore, subjectStats, globalStats, classStats } from '../store';
import { Subject } from '../types';

function Ring({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
    </svg>
  );
}

function MetricCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: string }) {
  return (
    <div className="rounded-2xl p-5 shimmer-card"
      style={{ background: 'var(--bg2)', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.2s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px) scale(1.02)'; el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.45), 0 0 20px ${color}15`; el.style.borderColor = color + '50'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = 'var(--line)'; }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color, opacity: 0.6 }} />
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-3xl font-bold tracking-tight mb-1" style={{ color, fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>{value}</div>
      <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--t1)' }}>{label}</div>
      {sub && <div className="text-xs mono" style={{ color: 'var(--t3)' }}>{sub}</div>}
    </div>
  );
}

function InsightCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: 'var(--bg2)', border: '1px solid var(--line)', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = color + '50'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'}>
      <div className="text-xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mono mb-0.5" style={{ color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: 9 }}>{label}</p>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{value}</p>
        {sub && <p className="text-xs mono" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

function SubjectBar({ s }: { s: Subject }) {
  const st = subjectStats(s);
  const openSubject = useStore(x => x.openSubject);
  return (
    <div data-hover onClick={() => openSubject(s.id, s.type === 'chemistry' ? 'Physical' : null)}
      className="flex items-center gap-4 p-3.5 rounded-xl"
      style={{ background: 'var(--bg3)', border: '1px solid var(--line)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; el.style.borderColor = 'var(--line2)'; el.style.background = 'var(--bg4)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = 'var(--line)'; el.style.background = 'var(--bg3)'; }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--t1)' }}>{s.name} <span className="font-normal" style={{ color: 'var(--t3)' }}>·{s.classNum}</span></span>
          <span className="text-xs mono font-bold" style={{ color: s.color }}>{st.pct}%</span>
        </div>
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg5)' }}>
          <div style={{ flex: st.mastered, background: 'var(--mastered)', transition: 'flex 0.6s ease' }} />
          <div style={{ flex: st.doing,    background: 'var(--doing)',    transition: 'flex 0.6s ease' }} />
          <div style={{ flex: Math.max(0, st.total - st.mastered - st.doing) }} />
        </div>
        {/* Chip row */}
        <div className="flex gap-2 mt-2">
          {[
            { label: 'Doing',     val: st.doing,    color: 'var(--doing)' },
            { label: 'Mastered',  val: st.mastered,  color: 'var(--mastered)' },
            { label: 'Revs',      val: st.revTotal,  color: 'var(--revision)' },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg5)', border: '1px solid var(--line)' }}>
              <span className="text-xs font-bold mono" style={{ color: chip.color }}>{chip.val}</span>
              <span className="text-xs mono" style={{ color: 'var(--t4)' }}>· {chip.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlagItem({ name, sub, color, badge, badgeCls }: { name: string; sub: string; color: string; badge: string; badgeCls: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-150"
      style={{ background: 'transparent' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--t2)' }}>{name}</p>
        <p className="text-xs mono" style={{ color: 'var(--t3)' }}>{sub}</p>
      </div>
      <span className={`text-xs mono px-2 py-0.5 rounded-full ${badgeCls}`}>{badge}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const subjects = useStore(s => s.subjects);
  const gs  = globalStats(subjects);
  const c11 = classStats(subjects, 11);
  const c12 = classStats(subjects, 12);

  const weak: any[]    = [];
  const needRev: any[] = [];

  subjects.forEach(s => s.chapters.forEach(ch => {
    if (!ch.doing && !ch.mastered)
      weak.push({ name: ch.title, sub: `${s.name} · Cl${s.classNum}`, color: s.color });
    if (ch.doing && !ch.mastered && !(ch.revisions || 0))
      needRev.push({ name: ch.title, sub: `${s.name} · Cl${s.classNum}`, color: s.color });
  }));

  // Insight data
  const topSubject = [...subjects].sort((a, b) => subjectStats(b).pct - subjectStats(a).pct)[0];
  const allChs = subjects.flatMap(s => s.chapters.map(c => ({ ...c, subName: s.name, color: s.color })));
  const mostRevised = [...allChs].sort((a, b) => (b.revisions || 0) - (a.revisions || 0))[0];
  const weakest = allChs.filter(c => !c.doing && !c.mastered)[0];
  const doneCount = allChs.filter(c => c.mastered || c.doing).length;
  const trendPct = allChs.length ? Math.round(doneCount / allChs.length * 100) : 0;

  return (
    <div className="h-full overflow-y-auto page-enter" style={{ background: 'var(--bg0)' }}>
      <div className="max-w-5xl mx-auto px-8 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.5px' }}>Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>A full picture of your JEE preparation.</p>
        </div>

        {/* Global metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard icon="🎯" label="Overall Score" value={`${gs.pct}%`}  sub={`${gs.scored} / ${gs.total * 2} pts`} color="var(--accent)" />
          <MetricCard icon="⚡" label="In Progress"   value={gs.doing}       sub={`of ${gs.total} chapters`} color="var(--doing)" />
          <MetricCard icon="🏆" label="Mastered"      value={gs.mastered}    sub={`${gs.total ? Math.round(gs.mastered/gs.total*100) : 0}% of syllabus`} color="var(--mastered)" />
          <MetricCard icon="🔄" label="Revisions"     value={gs.revTotal}    sub={`avg ${gs.total ? (gs.revTotal/gs.total).toFixed(1) : 0} per chapter`} color="var(--revision)" />
        </div>

        {/* Compact Insight Cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <InsightCard icon="⭐" label="Top Subject"     value={topSubject ? `${topSubject.name} ·${topSubject.classNum}` : '—'} sub={topSubject ? `${subjectStats(topSubject).pct}% done` : ''} color="var(--accent)" />
          <InsightCard icon="🔁" label="Most Revised"    value={mostRevised ? mostRevised.title.slice(0, 22) : 'None yet'} sub={mostRevised ? `${mostRevised.revisions}× revisions` : ''} color="var(--revision)" />
          <InsightCard icon="⚠️" label="Weakest Chapter" value={weakest ? weakest.title.slice(0, 22) : 'All started!'} sub={weakest ? weakest.subName : ''} color="#f87171" />
          <InsightCard icon="📈" label="Completion"      value={`${trendPct}% active`} sub={`${doneCount} of ${allChs.length} chapters`} color="var(--mastered)" />
        </div>

        {/* Class breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {([{ cls: 11, st: c11 }, { cls: 12, st: c12 }] as const).map(({ cls, st }) => (
            <div key={cls} className="rounded-2xl p-6"
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.4)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <Ring pct={st.pct} color={cls === 11 ? 'var(--doing)' : 'var(--mastered)'} size={88} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-bold mono" style={{ color: cls === 11 ? 'var(--doing)' : 'var(--mastered)' }}>{st.pct}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base mb-1" style={{ color: 'var(--t1)' }}>Class {cls}</p>
                  <p className="text-xs mono mb-3" style={{ color: 'var(--t3)' }}>{st.total} chapters total</p>
                  {/* Chip style stats */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: st.doing,    l: 'Doing',   c: 'var(--doing)' },
                      { v: st.mastered, l: 'Mastered', c: 'var(--mastered)' },
                      { v: st.revTotal, l: 'Revs',     c: 'var(--revision)' },
                    ].map(b => (
                      <div key={b.l} className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{ background: 'var(--bg4)', border: '1px solid var(--line)' }}>
                        <span className="text-sm font-bold mono" style={{ color: b.c }}>{b.v}</span>
                        <span className="text-xs mono" style={{ color: 'var(--t3)' }}>· {b.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subject breakdown */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Subject Breakdown</h2>
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map(s => <SubjectBar key={s.id} s={s} />)}
          </div>
        </div>

        {/* Flags — reduced height */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span>⚠️</span>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Weak Chapters</h3>
              <span className="text-xs mono ml-auto" style={{ color: 'var(--t3)' }}>not started</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {weak.length
                ? weak.map((f, i) => <FlagItem key={i} {...f} badge="not started" badgeCls="pill-doing" />)
                : <p className="text-xs mono py-3 text-center" style={{ color: 'var(--t4)' }}>🎉 None!</p>}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span>🔄</span>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Needs First Revision</h3>
              <span className="text-xs mono ml-auto" style={{ color: 'var(--t3)' }}>0 revisions</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {needRev.length
                ? needRev.map((f, i) => <FlagItem key={i} {...f} badge="revise now" badgeCls="pill-revision" />)
                : <p className="text-xs mono py-3 text-center" style={{ color: 'var(--t4)' }}>✓ All revised!</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="font-bold text-sm tracking-widest mono mb-1" style={{ color: 'var(--t2)', letterSpacing: '3px' }}>NEXUS OS</p>
          <p className="text-xs mono mb-2" style={{ color: 'var(--t4)', letterSpacing: '1.5px' }}>TRACK  ·  REVISE  ·  CONQUER</p>
          <p className="text-xs mono" style={{ color: 'var(--t4)' }}>crafted by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Yoki</span></p>
        </div>
      </div>
    </div>
  );
}
