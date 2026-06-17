'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore, globalStats, subjectStats } from '@/lib/store';import NavBar from './navbar';
import { SubjectIcon } from './subject-icon';
import { BookOpen, CheckCircle2, RotateCcw, Target, ArrowRight, ListChecks } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// Card base
const card = "bg-[#0f1219]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

export default function AnalyticsPage() {
  const { subjects, openSubject, progressHistory, setPage, resetProgressData, analyticsClassFilter, setAnalyticsClassFilter } = useStore();
  const classFilter = analyticsClassFilter;
  const setClassFilter = setAnalyticsClassFilter;
  const gs = globalStats(subjects);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isOpen = showResetConfirm || showResetSuccess;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showResetConfirm, showResetSuccess]);

  // ── Class filter ─────────────────────────────────────────────────────────
  const filteredSubjects = classFilter === 'all' ? subjects : subjects.filter(s => s.classNum === classFilter);

  // ── Stat card values ──────────────────────────────────────────────────────
  const allChapters = filteredSubjects.flatMap(s =>
    s.chapters.map(c => ({
      ...c,
      subjectName: s.name,
      subjectColor: s.color,
      subjectId: s.id,
      subjectType: s.type,
    }))
  );

  // Need Revision: doing or mastered, 0 revisions
  const chaptersToRevise = allChapters.filter(
    (c: any) => (c.doing || c.mastered) && (c.revisions || 0) === 0
  );
  // Need Practice: Lectures task done but NOT all tasks done (still has pending work)
  const chaptersToPractice = allChapters.filter(
    (c: any) => c.items?.some((i: any) => i.label === 'Lectures' && i.done) &&
                !c.mastered &&
                c.items?.some((i: any) => !i.done)
  );
  const chaptersMastered = allChapters.filter((c: any) => c.mastered);
  const chaptersDone = allChapters.filter((c: any) => c.done && !c.mastered);

  // Topics to revise = topics not done in doing chapters
  const topicsToRevise = chaptersToRevise.reduce(
    (acc, c) => acc + c.items.filter((i: any) => !i.done).length, 0
  );

  // ── Line chart data — history + live today point ─────────────────────────
  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const liveTodayDone = allChapters.reduce(
    (a: number, c: any) => a + (c.mastered ? c.items.length : c.items.filter((i: any) => i.done).length), 0
  );

  const historyData: { date: string; tasks: number }[] = progressHistory.map((p: any) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tasks: p.topicsDone,
  }));

  // Merge: if today already in history replace it with live count, else append
  const lastInHistory = historyData[historyData.length - 1];
  const chartData = lastInHistory?.date === todayLabel
    ? [...historyData.slice(0, -1), { date: todayLabel, tasks: liveTodayDone }]
    : [...historyData, { date: todayLabel, tasks: liveTodayDone }];

  const hasChartData = chartData.length >= 1;

  // ── Donut chart data ──────────────────────────────────────────────────────
  const subjectNames = ['Physics', 'Chemistry', 'Mathematics'];
  const donutColors: Record<string, string> = {
    Physics: '#7c3aed',
    Chemistry: '#6d28d9',
    Mathematics: '#4c1d95',
  };

  const donutData = subjectNames.map(name => {
    const matching = filteredSubjects.filter((s: any) => s.name === name);
    const tasksDone = matching.flatMap((s: any) => s.chapters).reduce(
      (a: number, c: any) => a + (c.mastered ? c.items.length : c.items.filter((i: any) => i.done).length), 0
    );
    const color = matching[0]?.color ?? donutColors[name];
    return { name, value: tasksDone, color };
  }).filter(d => d.value > 0);

  const totalTasksDone = donutData.reduce((a, d) => a + d.value, 0);

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <p className="text-white text-sm font-medium">Tasks Completed: {payload[0].value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] relative">
      {/* Background texture */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-900/8 blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid2" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid2)" />
        </svg>
      </div>

      <NavBar activeTab="Analytics" />

      <main className="relative pt-20 pb-10 px-4 sm:px-6 xl:px-10 space-y-5">

        {/* ── Header + 5 Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-4 items-stretch">
          {/* Title block */}
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 pr-0 lg:pr-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400 text-sm leading-snug">
              Track your preparation<br />and focus on what matters.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Class filter */}
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
                {(['all', 11, 12] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setClassFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      classFilter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {f === 'all' ? 'Both' : `Class ${f}`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-medium rounded-xl transition-colors w-fit"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Progress Data
              </button>
            </div>
          </div>

          {/* Tasks Completed */}
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-purple-300" />}
            iconBg="bg-purple-500/15"
            label="Tasks Completed"
            value={gs.topicsDone}
            subtext="Across all subjects"
          />
          {/* Chapters Mastered */}
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 text-purple-300" />}
            iconBg="bg-purple-500/15"
            label="Chapters Mastered"
            value={gs.mastered}
            subtext="Keep up the great work!"
          />
          {/* Chapters Done */}
          <StatCard
            icon={<ListChecks className="w-6 h-6 text-purple-300" />}
            iconBg="bg-purple-500/15"
            label="Chapters Done"
            value={chaptersDone.length}
            subtext="One step from Mastered"
          />
          {/* Chapters To Revise */}
          <StatCard
            icon={<RotateCcw className="w-6 h-6 text-purple-300" />}
            iconBg="bg-purple-500/15"
            label="Chapters To Revise"
            value={chaptersToRevise.length}
            subtext="Need more attention"
          />
          {/* Chapters To Practice */}
          <StatCard
            icon={<Target className="w-6 h-6 text-purple-300" />}
            iconBg="bg-purple-500/15"
            label="Chapters To Practice"
            value={chaptersToPractice.length}
            subtext="Strengthen your skills"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

          {/* Line Chart — Topic Completion Over Time */}
          <div className={`${card} p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Task Completion Over Time</p>
            </div>

            <div className="h-52 sm:h-64">
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.35)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.35)' }}
                      tickCount={6}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#areaGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5-5 4 4 5-6 4 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No data yet</p>
                  <p className="text-gray-600 text-xs max-w-[180px] leading-relaxed">Complete some tasks and the chart will update in real time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart — Subject Wise Topic Completion */}
          <div className={`${card} p-6 flex flex-col`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">Subject Wise Task Completion</p>

            <div className="flex flex-col items-center flex-1 justify-between">
              {/* Donut */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
                <PieChart width={176} height={176} className="sm:hidden">
                  <Pie
                    data={donutData.length > 0 ? donutData : [{ name: 'None', value: 1, color: '#1a1f2e' }]}
                    cx={88} cy={88}
                    innerRadius={55} outerRadius={84}
                    paddingAngle={2} dataKey="value"
                    startAngle={90} endAngle={-270}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
                <PieChart width={208} height={208} className="hidden sm:block">
                  <Pie
                    data={donutData.length > 0 ? donutData : [{ name: 'None', value: 1, color: '#1a1f2e' }]}
                    cx={104} cy={104}
                    innerRadius={62} outerRadius={96}
                    paddingAngle={2} dataKey="value"
                    startAngle={90} endAngle={-270}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold text-white leading-none">{totalTasksDone}</span>
                  <span className="text-gray-400 text-sm mt-1">Total Tasks</span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full space-y-3 mt-4">
                {subjectNames.map(name => {
                  const d = donutData.find(x => x.name === name);
                  const value = d?.value ?? 0;
                  const color = d?.color ?? '#4c1d95';
                  const pct = totalTasksDone > 0 ? Math.round((value / totalTasksDone) * 100) : 0;
                  return (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-gray-300 text-sm">{name}</span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {value} <span className="text-gray-500">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Part 3B placeholder ── */}
        <ChapterListsAndSummary
          allChapters={allChapters}
          chaptersToRevise={chaptersToRevise}
          chaptersToPractice={chaptersToPractice}
          chaptersMastered={chaptersMastered}
          chaptersDone={chaptersDone}
          openSubject={openSubject}
          subjects={filteredSubjects}
          setPage={setPage}
        />

      </main>

      {/* ── Reset Confirm Modal ── */}
      {showResetConfirm && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onWheel={e => e.preventDefault()}
          onTouchMove={e => e.preventDefault()}
        >
          <div className="bg-[#0f1219] border border-white/10 rounded-2xl w-[calc(100vw-2rem)] max-w-[340px] shadow-2xl">
            {/* Icon + title */}
            <div className="pt-7 px-6 pb-5 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-[15px] font-bold">Reset Progress Data</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">Clears your progress only — chapters<br />and tasks stay untouched.</p>
              </div>
            </div>

            {/* Single list */}
            <div className="mx-5 mb-5 bg-white/[0.03] border border-white/[0.07] rounded-xl divide-y divide-white/[0.05]">
              {[
                { label: 'Doing / mastered statuses', cleared: true },
                { label: 'Revision counts', cleared: true },
                { label: 'Task completions (Lectures, DPPs)', cleared: true },
                { label: 'Progress history chart', cleared: true },
                { label: 'All chapters & custom tasks', cleared: false },
                { label: 'Profile & exam settings', cleared: false },
              ].map(({ label, cleared }) => (
                <div key={label} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${cleared ? 'bg-red-500/10 border border-red-500/25' : 'bg-white/5 border border-white/10'}`}>
                    {cleared ? (
                      <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-[12px] ${cleared ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
                  <span className={`ml-auto text-[10px] font-medium shrink-0 ${cleared ? 'text-red-400/70' : 'text-gray-600'}`}>
                    {cleared ? 'cleared' : 'kept'}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 px-5 pb-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 text-gray-400 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetProgressData(); setShowResetConfirm(false); setShowResetSuccess(true); }}
                className="flex-1 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-500 text-sm font-semibold rounded-xl transition-colors"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Reset Success Modal ── */}
      {showResetSuccess && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1219] border border-white/10 rounded-2xl w-[calc(100vw-2rem)] max-w-[340px] shadow-2xl text-center">
            <div className="pt-8 px-7 pb-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-[15px] font-bold mb-1">Progress Data Reset</h3>
                <p className="text-gray-500 text-sm leading-relaxed">All statuses and task completions cleared.<br />Chapters and custom tasks are intact.</p>
              </div>
              <button
                onClick={() => setShowResetSuccess(false)}
                className="w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-500 text-sm font-medium rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ChapterListsAndSummary({ allChapters, chaptersToRevise, chaptersToPractice, chaptersMastered, chaptersDone, openSubject, subjects, setPage }: any) {
  const totalChapters = allChapters.length;
  const masteredCount = chaptersMastered.length;
  const doneCount = chaptersDone.length;
  const inProgressCount = allChapters.filter((c: any) => c.doing && !c.mastered).length;
  // Need Practice = chapters where Lectures are done but not mastered yet
  const needPracticeCount = chaptersToPractice.filter((c: any) => !c.mastered).length;
  // Not Started = none of the above
  const notStartedCount = Math.max(0, totalChapters - masteredCount - doneCount - inProgressCount - needPracticeCount);

  const pct = (n: number) => totalChapters ? Math.round((n / totalChapters) * 100) : 0;

  return (
    <>
      {/* ── 4 Chapter Lists ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ChapterListCard
          title="Need Revision"
          subtitle="Doing or mastered with 0 revisions"
          chapters={chaptersToRevise}
          barColor="#eab308"
          viewLabel="View all to revise"
          openSubject={openSubject}
          subjects={subjects}
          setPage={setPage}
          filterMode="needRevision"
        />
        <ChapterListCard
          title="Need Practice"
          subtitle="Lectures completed, practice more"
          chapters={chaptersToPractice}
          barColor="#3b82f6"
          viewLabel="View all to practice"
          openSubject={openSubject}
          subjects={subjects}
          setPage={setPage}
          filterMode="needPractice"
        />
        <ChapterListCard
          title="Chapters You've Completed"
          subtitle="Marked done, not mastered yet"
          chapters={chaptersDone}
          barColor="#14b8a6"
          viewLabel="View all completed"
          openSubject={openSubject}
          subjects={subjects}
          setPage={setPage}
          filterMode="done"
        />
        <ChapterListCard
          title="Chapters You've Mastered"
          subtitle="Excellent work! Keep it up."
          chapters={chaptersMastered}
          barColor="#22c55e"
          viewLabel="View all mastered"
          openSubject={openSubject}
          subjects={subjects}
          setPage={setPage}
          filterMode="mastered"
        />
      </div>

      {/* ── Chapter Progress Summary ── */}
      <div className="bg-[#0f1219]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Chapter Progress Summary</p>
        <p className="text-gray-500 text-sm mb-5">Overview of your preparation across all chapters</p>

        {/* Segmented bar — 5 real segments, all width-based */}
        <div className="h-5 flex rounded-lg overflow-hidden mb-6 gap-px bg-white/5">
          <div className="bg-green-500 transition-all"  style={{ width: `${pct(masteredCount)}%` }} />
          <div className="bg-teal-500 transition-all"   style={{ width: `${pct(doneCount)}%` }} />
          <div className="bg-purple-500 transition-all" style={{ width: `${pct(inProgressCount)}%` }} />
          <div className="bg-blue-500 transition-all"   style={{ width: `${pct(needPracticeCount)}%` }} />
          <div className="bg-gray-600 transition-all"   style={{ width: `${pct(notStartedCount)}%` }} />
        </div>

        {/* 6 stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {/* Total */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{totalChapters}</p>
          </div>
          {/* Mastered */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <p className="text-gray-500 text-sm">Mastered</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {masteredCount}{' '}
              <span className="text-gray-500 text-xs sm:text-base font-normal">({pct(masteredCount)}%)</span>
            </p>
          </div>
          {/* Done */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              <p className="text-gray-500 text-sm">Done</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {doneCount}{' '}
              <span className="text-gray-500 text-xs sm:text-base font-normal">({pct(doneCount)}%)</span>
            </p>
          </div>
          {/* In Progress */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              <p className="text-gray-500 text-sm">In Progress</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {inProgressCount}{' '}
              <span className="text-gray-500 text-xs sm:text-base font-normal">({pct(inProgressCount)}%)</span>
            </p>
          </div>
          {/* Need Practice */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <p className="text-gray-500 text-sm">Need Practice</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {needPracticeCount}{' '}
              <span className="text-gray-500 text-xs sm:text-base font-normal">({pct(needPracticeCount)}%)</span>
            </p>
          </div>
          {/* Not Started */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-gray-600 shrink-0" />
              <p className="text-gray-500 text-sm">Not Started</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {notStartedCount}{' '}
              <span className="text-gray-500 text-xs sm:text-base font-normal">({pct(notStartedCount)}%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-5 pb-[env(safe-area-inset-bottom)] border-t border-white/[0.04] flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-sm text-gray-700 text-center sm:text-left">
        <span>Zenith — Syllabus Tracking Platform for JEE Aspirants</span>
        
        <span>Designed &amp; Developed by Yoki</span>
      </footer>
    </>
  );
}

function ChapterListCard({ title, subtitle, chapters, barColor, viewLabel, openSubject, subjects, setPage }: any) {
  return (
    <div className="bg-[#0f1219]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-5 flex flex-col">
      {/* Header */}
      <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold mb-0.5">{title}</p>
      <p className="text-gray-500 text-xs mb-4">{subtitle}</p>

      {/* Column labels */}
      <div className="flex items-center justify-between text-xs text-gray-600 uppercase tracking-wider mb-3 px-0.5">
        <span />
        <span>Status</span>
      </div>

      {/* Chapter rows — fixed height, invisible scroll */}
      <div className="overflow-y-auto flex-1 space-y-4 max-h-[244px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chapters.length === 0 ? (
          <p className="text-gray-600 text-sm py-8 text-center">None yet</p>
        ) : (
          chapters.map((ch: any, idx: number) => {
            const done = ch.items?.filter((i: any) => i.done).length ?? 0;
            const total = ch.items?.length ?? 0;
            const pct = total > 0 ? (done / total) * 100 : 0;
            return (
              <button
                key={idx}
                onClick={() => openSubject(ch.subjectId, ch.subjectType === 'chemistry' ? 'Physical' : null)}
                className="w-full flex items-center gap-3 group text-left"
              >
                {/* Subject icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${ch.subjectColor}18` }}
                >
                  <SubjectIcon name={ch.subjectName} className="w-4 h-4" style={{ color: ch.subjectColor }} />
                </div>

                {/* Name + subject */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-purple-300 transition-colors leading-tight">
                    {ch.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{ch.subjectName}</p>
                </div>

                {/* Progress bar + count */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs text-right whitespace-nowrap">
                    {done}/{total}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* View all button */}
      <button onClick={() => setPage('subjects')} className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-[#1a1f2e] hover:bg-[#1f2640] border border-white/8 rounded-xl text-sm text-gray-300 hover:text-white transition-all w-fit">
        {viewLabel} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, subtext }: {
  icon: React.ReactNode; iconBg: string; label: string; value: number; subtext: string;
}) {
  return (
    <div className="bg-[#0f1219]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs sm:text-sm mb-1 leading-snug">{label}</p>
        <p className="text-3xl sm:text-4xl font-bold text-white leading-none mb-1">{value}</p>
        <p className="text-gray-500 text-xs">{subtext}</p>
      </div>
    </div>
  );
}

function AnalyticsRow({ label, cleared, kept }: { label: string; cleared?: boolean; kept?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {cleared && (
        <span className="w-4 h-4 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
      {kept && (
        <span className="w-4 h-4 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className={cleared ? 'text-red-300/80' : 'text-green-300/80'}>{label}</span>
    </div>
  );
}
