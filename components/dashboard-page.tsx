'use client';

import { useEffect, useState } from 'react';
import { useStore, globalStats } from '@/lib/store';
import NavBar from './navbar';
import { SubjectIcon } from './subject-icon';
import { ArrowRight, ChevronRight, ChevronLeft, TrendingUp, RotateCcw, Target, BarChart3, Calendar } from 'lucide-react';

function Sparkline({ color = '#8b5cf6' }: { color?: string }) {
  const id = `sg${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 120 36" className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,30 C10,28 15,24 22,20 C30,16 35,22 44,18 C52,14 58,10 66,12 C74,14 80,8 90,6 C100,4 110,8 120,5"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M0,30 C10,28 15,24 22,20 C30,16 35,22 44,18 C52,14 58,10 66,12 C74,14 80,8 90,6 C100,4 110,8 120,5 L120,36 L0,36 Z"
        fill={`url(#${id})`} />
    </svg>
  );
}

// Glassmorphism card base classes
const card = "bg-[#0f1219]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

export default function DashboardPage() {
  const { subjects, setPage, openSubject, recordProgressSnapshot, user } = useStore();
  const gs = globalStats(subjects);

  useEffect(() => { recordProgressSnapshot(); }, [recordProgressSnapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  const doingChapters = subjects
    .flatMap((s) => s.chapters.map((c) => ({ ...c, subjectName: s.name, subjectId: s.id, subjectColor: s.color, subjectType: s.type })))
    .filter((c) => c.doing);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(0, doingChapters.length - 1));
  const activeEntry = doingChapters[safeIndex] ?? null;

  const activeDone = activeEntry?.items?.filter((i) => i.done).length ?? 0;
  const activeTotal = activeEntry?.items?.length ?? 0;
  const activePct = activeTotal > 0 ? Math.round((activeDone / activeTotal) * 100) : 0;
  const activeSubjectName = activeEntry?.subjectName ?? 'None';

  const examDateStr = user?.examDate || '2027-01-20';
  const jeeDate = new Date(`${examDateStr}T00:00:00`);
  const diffMs = jeeDate.getTime() - Date.now();
  const diffDays = Math.max(0, Math.ceil(diffMs / 86400000));
  const examName = user?.examName || 'JEE Main 2027';
  const targetDateRaw = user?.targetDate || '';
  const targetDate = targetDateRaw
    ? new Date(`${targetDateRaw}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  // Days until target finish
  const targetDiffDays = targetDateRaw
    ? Math.max(0, Math.ceil((new Date(`${targetDateRaw}T00:00:00`).getTime() - Date.now()) / 86400000))
    : null;
  // Timeline progress: how far today is between target finish and exam
  const timelinePct = targetDateRaw && diffDays > 0
    ? Math.min(100, Math.max(0, Math.round(((diffDays - targetDiffDays!) / diffDays) * 100)))
    : null;

  const subjectNames = ['Physics', 'Chemistry', 'Mathematics'];
  const combinedSubjects = subjectNames.map((name) => {
    const matching = subjects.filter((s) => s.name === name);
    const first = matching[0];
    if (!first) return null;
    const allChapters = matching.flatMap((s) => s.chapters);
    const topicsTotal = allChapters.reduce((a, c) => a + c.items.length, 0);
    // Mastered chapter = all its tasks count as done
    const topicsDone = allChapters.reduce((a, c) =>
      a + (c.mastered ? c.items.length : c.items.filter((i) => i.done).length), 0);
    const pct = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;
    return { name, color: first.color, type: first.type, id: first.id, topicsTotal, topicsDone, pct, total: allChapters.length, mastered: allChapters.filter((c) => c.mastered).length };
  }).filter(Boolean) as NonNullable<ReturnType<typeof subjectNames.map>[0]>[];

  // Overall progress based on mastered chapters (matches what users actively track)
  const totalChapters = combinedSubjects.reduce((a, s) => a + s.total, 0);
  const totalMastered = combinedSubjects.reduce((a, s) => a + s.mastered, 0);
  const totalTopicsDone = combinedSubjects.reduce((a, s) => a + s.topicsDone, 0);
  const totalTopicsTotal = combinedSubjects.reduce((a, s) => a + s.topicsTotal, 0);
  const overallPct = totalTopicsTotal ? Math.round((totalTopicsDone / totalTopicsTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0d14] relative">
      {/* Subtle background texture: radial glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-900/8 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-900/8 blur-[100px]" />
        {/* Subtle dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
      </div>

      <NavBar activeTab="Dashboard" />

      <main className="relative pt-20 pb-10 px-4 sm:px-6 xl:px-10 space-y-4">

        {/* ── Row 1: Current Chapter + Exam Countdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

          {/* Current Chapter */}
          <div className={`${card} p-5 flex flex-col`}>
            <p className="font-label text-gray-500 mb-3">Current Chapter</p>
            {activeEntry ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${activeEntry.subjectColor}18` }}>
                    <SubjectIcon name={activeEntry.subjectName} className="w-7 h-7" style={{ color: activeEntry.subjectColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm">{activeEntry.subjectName}</p>
                    <h3 className="text-white font-semibold text-lg sm:text-xl leading-tight">{activeEntry.title}</h3>
                  </div>
                  {/* Nav arrows — cycle through doing chapters */}
                  {doingChapters.length > 1 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setActiveIndex(i => (i - 1 + doingChapters.length) % doingChapters.length)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-gray-600 text-xs w-8 text-center">{safeIndex + 1}/{doingChapters.length}</span>
                      <button
                        onClick={() => setActiveIndex(i => (i + 1) % doingChapters.length)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2.5 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-400">Task Progress</span>
                      <span className="text-white">{activeDone} / {activeTotal}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${activePct}%`, background: activeEntry.subjectColor }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {activeEntry.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className={item.done ? 'text-green-400' : 'text-yellow-400'}>{item.done ? 'Done' : 'Pending'}</span>
                      </div>
                    ))}
                    {activeEntry.items.length > 3 && (
                      <p className="text-gray-600 text-xs">+{activeEntry.items.length - 3} more tasks</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openSubject(activeEntry.subjectId, activeEntry.chemSection ?? null)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/8 text-white text-sm font-medium rounded-xl transition-colors mt-auto w-fit"
                >
                  Continue Studying <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <SubjectIcon name="Physics" className="w-7 h-7 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm mt-1">No active chapter yet</p>
                <p className="text-gray-600 text-xs">Mark a chapter as "Doing" to track it here</p>
                <button onClick={() => setPage('subjects')} className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-xl hover:bg-purple-500/30 transition-colors">
                  Browse Subjects <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Exam Countdown */}
          <div className={`${card} p-5 relative overflow-hidden flex flex-col`}>
            <p className="font-label text-gray-500 mb-2">Exam Countdown</p>
            <h3 className="text-white font-semibold text-lg mb-2">{examName}</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display text-[3rem] sm:text-[4.5rem] text-white leading-none">{diffDays}</span>
              <span className="text-xl sm:text-2xl text-gray-400 mb-2">Days Left</span>
            </div>

            {targetDate ? (
              <>
                {/* Two-stat row */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                    <p className="text-gray-500 text-xs mb-0.5">Target Finish</p>
                    <p className="text-white text-sm font-semibold">{targetDiffDays}d left</p>
                    <p className="text-gray-600 text-xs">{targetDate}</p>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                    <p className="text-gray-500 text-xs mb-0.5">Exam Date</p>
                    <p className="text-white text-sm font-semibold">{diffDays}d left</p>
                    <p className="text-gray-600 text-xs">{examName}</p>
                  </div>
                </div>
                {/* Timeline bar: Today ──●── Target ──── Exam */}
                <div>
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
                    <div className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all" style={{ width: `${timelinePct}%` }} />
                    {/* Target marker */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-2 border-purple-400" style={{ left: `calc(${timelinePct}% - 4px)` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Today</span>
                    <span>Target</span>
                    <span>Exam</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Set a target finish date in your profile</span>
              </div>
            )}

            {/* Calendar illustration — positioned bottom-right, properly contained */}
            <div className="absolute bottom-4 right-6 opacity-[0.12] pointer-events-none">
              <svg width="110" height="110" viewBox="0 0 140 140" fill="none">
                <rect x="10" y="24" width="120" height="106" rx="14" fill="white" />
                <rect x="10" y="24" width="120" height="38" rx="14" fill="white" />
                <rect x="36" y="10" width="10" height="24" rx="5" fill="white" />
                <rect x="94" y="10" width="10" height="24" rx="5" fill="white" />
                <rect x="26" y="80" width="14" height="12" rx="3" fill="#aaa" />
                <rect x="50" y="80" width="14" height="12" rx="3" fill="#aaa" />
                <rect x="74" y="80" width="14" height="12" rx="3" fill="#aaa" />
                <rect x="98" y="80" width="14" height="12" rx="3" fill="#aaa" />
                <rect x="26" y="104" width="14" height="12" rx="3" fill="#999" />
                <rect x="50" y="104" width="14" height="12" rx="3" fill="#888" />
                <rect x="74" y="104" width="14" height="12" rx="3" fill="#777" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Row 2: Syllabus Overview ── */}
        <div className={`${card} p-5`}>
          <p className="font-label text-gray-500 mb-4">Syllabus Overview</p>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-52 shrink-0">
              <p className="text-gray-400 text-sm mb-1">Overall Progress</p>
              <p className="font-display text-5xl sm:text-6xl text-white leading-none mb-1">{overallPct}<span className="text-2xl sm:text-3xl">%</span></p>
              <p className="text-gray-500 text-sm mt-2">{totalMastered} / {totalChapters} Chapters Mastered</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-400 text-xs">{overallPct >= 60 ? 'Excellent pace!' : overallPct >= 35 ? 'On Track' : 'Keep going!'}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-5">
              {combinedSubjects.map((subject) => (
                <button key={subject.name} onClick={() => openSubject(subject.id, subject.type === 'chemistry' ? 'Physical' : null)} className="flex items-center gap-4 group w-full">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${subject.color}18` }}>
                    <SubjectIcon name={subject.name} className="w-5 h-5" style={{ color: subject.color }} />
                  </div>
                  <span className="text-gray-300 text-sm w-24 text-left shrink-0">{subject.name}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${subject.pct}%`, background: subject.color }} />
                  </div>
                  <span className="text-gray-300 text-sm w-10 text-right shrink-0">{subject.pct}%</span>
                  <span className="hidden sm:block text-gray-500 text-xs w-16 text-right shrink-0">{subject.topicsDone} / {subject.topicsTotal}</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Completion %" value={`${overallPct}%`} subtext="Chapters Mastered" icon={<TrendingUp className="w-5 h-5" />} color="purple" sparkColor="#8b5cf6" />
          <StatCard label="Revision Count" value={gs.revTotal.toString()} subtext="Total Revisions" icon={<RotateCcw className="w-5 h-5" />} color="green" sparkColor="#22c55e" />
          <StatCard label="Active Subject" value={activeSubjectName} subtext={activeEntry ? "Currently in Focus" : "No active chapter"} icon={<Target className="w-5 h-5" />} color="blue" sparkColor="#3b82f6" />

          {/* Analytics CTA */}
          <div className={`${card} p-5 flex flex-col gap-4`}>
            {/* Top row: icon + text side by side */}
            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-[#16102a] border border-purple-500/15 flex items-center justify-center shrink-0">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
              <p className="text-gray-300 text-sm leading-snug text-center">View detailed performance and analytics</p>
            </div>
            {/* Button at bottom */}
            <button
              onClick={() => setPage('analytics')}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#13161f] hover:bg-[#1a1f2e] border border-white/8 text-white text-sm font-medium rounded-xl transition-colors mt-auto"
            >
              Go to Analytics <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Row 4: Subjects Overview — one outer card, 3 inner floating cards ── */}
        <div className={`${card} p-5`}>
          <p className="font-label text-gray-500 mb-4">Subjects Overview</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {combinedSubjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => openSubject(subject.id, subject.type === 'chemistry' ? 'Physical' : null)}
                className="bg-[#0d1018] border border-white/[0.06] rounded-xl p-4 text-left hover:border-white/10 transition-all group flex flex-col gap-3"
              >
                {/* Icon + name/topics */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${subject.color}15` }}
                  >
                    <SubjectIcon name={subject.name} className="w-6 h-6" style={{ color: subject.color }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{subject.name}</p>
                    <p className="text-gray-500 text-xs">{subject.topicsDone} / {subject.topicsTotal} Tasks Completed</p>
                  </div>
                </div>

                {/* Progress bar + % on right — task completion */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${subject.topicsTotal ? Math.round((subject.topicsDone / subject.topicsTotal) * 100) : 0}%`, background: subject.color }} />
                  </div>
                  <span className="text-gray-400 text-xs font-medium shrink-0">{subject.topicsTotal ? Math.round((subject.topicsDone / subject.topicsTotal) * 100) : 0}%</span>
                </div>

                {/* View Chapters */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                  View Chapters <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-sm text-gray-500 text-center sm:text-left">
          <span>Nexus — Syllabus Tracking Platform for JEE Aspirants</span>
          
          <span>Designed &amp; Developed by Yoki</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, subtext, icon, color, sparkColor }: {
  label: string; value: string; subtext: string; icon: React.ReactNode; color: 'purple' | 'green' | 'blue'; sparkColor: string;
}) {
  const textColors = { purple: 'text-purple-400', green: 'text-green-400', blue: 'text-blue-400' };
  return (
    <div className="bg-[#0f1219]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <p className="font-label text-gray-500 truncate pr-2">{label}</p>
        <span className={`${textColors[color]} shrink-0`}>{icon}</span>
      </div>
      <p className="font-display text-2xl sm:text-3xl text-white mb-1 truncate">{value}</p>
      <p className="text-gray-500 text-xs leading-snug">{subtext}</p>
      <div className="mt-3 -mx-1"><Sparkline color={sparkColor} /></div>
    </div>
  );
}
