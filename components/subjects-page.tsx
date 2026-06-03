'use client';

import { useStore, globalStats } from '@/lib/store';
import NavBar from './navbar';
import { SubjectIcon } from './subject-icon';
import { ChevronRight, BookOpen, CheckCircle2, ClipboardList } from 'lucide-react';

export default function SubjectsPage() {
  const { subjects, openSubject } = useStore();
  const gs = globalStats(subjects);

  // 3 combined cards — merge Class 11 + 12 per subject name
  const subjectNames = ['Physics', 'Chemistry', 'Mathematics'];
  const combined = subjectNames.map((name) => {
    const matching = subjects.filter((s) => s.name === name);
    const first = matching[0];
    if (!first) return null;
    const allChapters = matching.flatMap((s) => s.chapters);
    const topicsTotal = allChapters.reduce((a, c) => a + c.items.length, 0);
    // Mastered chapter = all its tasks count as done
    const topicsDone = allChapters.reduce((a, c) =>
      a + (c.mastered ? c.items.length : c.items.filter((i) => i.done).length), 0);
    const mastered = allChapters.filter((c) => c.mastered).length;
    const revTotal = allChapters.reduce((a, c) => a + (c.revisions || 0), 0);
    const taskPct = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;
    const chapterPct = allChapters.length ? Math.round((mastered / allChapters.length) * 100) : 0;
    // Show task completion as primary progress — reflects actual work done even before mastering
    const pct = taskPct;
    return {
      name,
      color: first.color,
      type: first.type,
      id: first.id,
      allChapters: allChapters.length,
      mastered,
      topicsTotal,
      topicsDone,
      revTotal,
      pct,
      taskPct,
    };
  }).filter(Boolean) as NonNullable<ReturnType<typeof subjectNames.map>[0]>[];

  const completedSubjects = combined.filter((s) => s.pct === 100).length;

  // Overall progress = task completion across all subjects
  const totalChapters = combined.reduce((a, s) => a + s.allChapters, 0);
  const totalMastered = combined.reduce((a, s) => a + s.mastered, 0);
  const totalTopicsDone = combined.reduce((a, s) => a + s.topicsDone, 0);
  const totalTopicsTotal = combined.reduce((a, s) => a + s.topicsTotal, 0);
  const overallPct = totalTopicsTotal ? Math.round((totalTopicsDone / totalTopicsTotal) * 100) : 0;

  const descriptions: Record<string, string> = {
    Physics: 'Explore the fundamental laws of nature and understand how the universe works.',
    Chemistry: 'Dig into the structure, properties and transformations of matter.',
    Mathematics: 'Build strong problem solving skills and master mathematical concepts.',
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] relative">
      {/* Background texture */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-900/8 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-900/8 blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid-sub" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid-sub)" />
        </svg>
      </div>
      <NavBar activeTab="Subjects" />

      <main className="relative pt-20 px-4 sm:px-6 xl:px-10 flex flex-col min-h-screen">

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-6 mb-10">
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-5xl text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Syllabus</h1>
            <p className="text-gray-400 text-sm">Access your subjects and track your syllabus progress.</p>
          </div>

          {/* Overall progress card */}
          <div className="bg-[#0f1219] border border-white/5 rounded-2xl px-6 py-4 min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Overall Syllabus Progress</span>
              <span className="text-purple-400 font-bold text-base">{overallPct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all bg-purple-500" style={{ width: `${overallPct}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-gray-500 text-sm">{completedSubjects} / 3 Subjects Completed</span>
            </div>
          </div>
        </div>

        {/* ── 3 Subject cards ── */}
        <div className="space-y-5">
          {combined.map((subject) => (
            <button
              key={subject.name}
              onClick={() => openSubject(subject.id, subject.type === 'chemistry' ? 'Physical' : null)}
              className="w-full bg-[#0f1219] border border-white/5 rounded-2xl p-6 flex items-center gap-6 hover:border-white/10 transition-all group text-left"
            >
              {/* Icon box */}
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${subject.color}12` }}
              >
                <SubjectIcon name={subject.name} className="w-14 h-14" style={{ color: subject.color }} />
              </div>

              {/* Name + description + stats */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-semibold text-white mb-1">{subject.name}</h3>
                <p className="text-gray-500 text-sm mb-5">{descriptions[subject.name]}</p>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-300 text-sm font-medium">{subject.mastered} / {subject.allChapters}</span>
                    <span className="text-gray-600 text-sm">Chapters Mastered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-300 text-sm font-medium">{subject.topicsDone} / {subject.topicsTotal}</span>
                    <span className="text-gray-600 text-sm">Topics Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-300 text-sm font-medium">{subject.revTotal}</span>
                    <span className="text-gray-600 text-sm">Pending Revisions</span>
                  </div>
                </div>
              </div>

              {/* Progress + arrow */}
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <p className="text-gray-500 text-xs mb-1">Progress</p>
                  <p className="text-white font-bold text-xl">{subject.pct}%</p>
                  <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${subject.pct}%`, background: subject.color }}
                    />
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-1" />

        <footer className="mt-auto pt-6 pb-6 border-t border-white/5 flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-sm text-gray-500 text-center sm:text-left">
          <span>Nexus — Syllabus Tracking Platform for JEE Aspirants</span>
          
          <span>Designed &amp; Developed by Yoki</span>
        </footer>
      </main>
    </div>
  );
}
