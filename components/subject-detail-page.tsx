'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, subjectStats } from '@/lib/store';
import NavBar from './navbar';
import { SubjectIcon } from './subject-icon';
import {
  ArrowLeft, ChevronRight, Search, Pencil,
  BookOpen, CheckCircle2, RotateCcw, ClipboardList,
  Check, Copy, CopyCheck, Plus, Trash2, GripVertical, X,
} from 'lucide-react';
import { CHEM_SECTIONS, CHEM_LABELS } from '@/lib/seed-data';

interface CtxMenu {
  x: number; y: number;
  itemId: string; itemLabel: string; itemDone: boolean; chapterId: string;
}

export default function SubjectDetailPage() {
  const {
    subjects, currentSubId, currentChemSection, currentClassNum,
    setPage, setCurrentClassNum, openSubject,
    toggleDoing, toggleMastered, changeRevisions,
    addItem, toggleItem, deleteItem,
    addChapter, deleteChapter, updateChapter, reorderChapters,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const [copyStep, setCopyStep] = useState<'idle' | 'pick'>('idle');
  const [editOpen, setEditOpen] = useState(false);
  const [needRevisionMode, setNeedRevisionMode] = useState(false);
  const [needPracticeMode, setNeedPracticeMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const ctxRef = useRef<HTMLDivElement>(null);

  const subject = subjects.find(s => s.id === currentSubId);
  if (!subject) return null;

  const isChem = subject.type === 'chemistry';
  const activeSec = isChem ? (currentChemSection || 'Physical') : null;
  const chapters = activeSec
    ? subject.chapters.filter(c => c.chemSection === activeSec)
    : subject.chapters;
  const st = subjectStats(subject, activeSec);

  const filteredChapters = chapters.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRevision = !needRevisionMode || ((c.doing || c.mastered) && c.revisions === 0);
    const matchesPractice = !needPracticeMode || (!c.mastered && c.items.some((i: any) => i.label === 'Lectures' && i.done));
    return matchesSearch && matchesRevision && matchesPractice;
  });

  useEffect(() => {
    if (!ctxMenu) return;
    const onDown = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) closeCtx();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCtx(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [ctxMenu]);

  const closeCtx = () => { setCtxMenu(null); setCopyStep('idle'); };

  const openCtx = (e: React.MouseEvent, itemId: string, itemLabel: string, itemDone: boolean, chapterId: string) => {
    e.preventDefault(); e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 220);
    setCtxMenu({ x, y, itemId, itemLabel, itemDone, chapterId });
    setCopyStep('idle');
  };

  const handleMarkDone = () => {
    if (!ctxMenu) return;
    toggleItem(subject.id, ctxMenu.chapterId, ctxMenu.itemId);
    closeCtx();
  };

  const handleCopyToChapter = (targetChapterId: string) => {
    if (!ctxMenu) return;
    const target = chapters.find(c => c.id === targetChapterId);
    const exists = target?.items.some(i => i.label.trim().toLowerCase() === ctxMenu.itemLabel.trim().toLowerCase());
    if (!exists) addItem(subject.id, targetChapterId, ctxMenu.itemLabel);
    closeCtx();
  };

  const handleCopyToAll = () => {
    if (!ctxMenu) return;
    chapters.filter(c => c.id !== ctxMenu.chapterId).forEach(c => {
      const exists = c.items.some(i => i.label.trim().toLowerCase() === ctxMenu.itemLabel.trim().toLowerCase());
      if (!exists) addItem(subject.id, c.id, ctxMenu.itemLabel);
    });
    closeCtx();
  };

  const handleDeleteItem = () => {
    if (!ctxMenu) return;
    deleteItem(subject.id, ctxMenu.chapterId, ctxMenu.itemId);
    closeCtx();
  };

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
            <pattern id="dotgrid-det" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid-det)" />
        </svg>
      </div>
      <NavBar activeTab="Subjects" />

      <main className="relative pt-20 flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">
        <div className="px-4 sm:px-6 xl:px-10 mb-4 shrink-0 flex items-center justify-between">
          <button onClick={() => setPage('subjects')} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Subjects</span>
          </button>
          {/* Mobile: toggle sidebar */}
          <button
            onClick={() => setMobileSidebarOpen(o => !o)}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white text-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Overview
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
          {/* Mobile bottom-sheet backdrop */}
          {mobileSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar — bottom sheet on mobile, left panel on sm+ */}
          <aside className={`
            lg:relative lg:translate-x-0 lg:translate-y-0 lg:top-auto lg:left-auto lg:h-auto lg:z-auto lg:bg-transparent
            fixed z-40 left-0 right-0 bottom-0
            w-full lg:w-72 shrink-0 lg:border-r lg:border-white/5 lg:overflow-y-auto
            bg-[#0d1018] rounded-t-2xl lg:rounded-none border-t border-white/10 lg:border-t-0
            transition-transform duration-300 ease-out
            ${mobileSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            max-h-[75vh] lg:max-h-none overflow-y-auto lg:overflow-y-auto
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          `}>
            {/* Mobile drag handle */}
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-6 sm:px-6">
            {/* Close button mobile */}
            <div className="lg:hidden flex items-center justify-between mb-4 pt-2">
              <h3 className="text-white font-semibold text-base">Overview</h3>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden lg:flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${subject.color}15` }}>
                <SubjectIcon name={subject.name} className="w-8 h-8" style={{ color: subject.color }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{subject.name}</h2>
                <p className="text-gray-400 text-sm mt-1">Class {subject.classNum}</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-6">{descriptions[subject.name]}</p>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Classes</p>
              <div className="space-y-1">
                {([11, 12] as const).map(cn => (
                  <button key={cn}
                    onClick={() => {
                      setCurrentClassNum(cn);
                      setExpandedChapter(null);
                      setSearchQuery('');
                      const s = subjects.find(s => s.name === subject.name && s.classNum === cn);
                      if (s) openSubject(s.id, isChem ? (currentChemSection || 'Physical') : null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${subject.classNum === cn ? 'bg-purple-500/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Class {cn}</span>
                    {subject.classNum === cn && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {isChem && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Section</p>
                <div className="space-y-1">
                  {CHEM_SECTIONS.map(sec => (
                    <button key={sec} onClick={() => { openSubject(subject.id, sec); setExpandedChapter(null); setSearchQuery(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${activeSec === sec ? 'bg-purple-500/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {CHEM_LABELS[sec]}
                      {activeSec === sec && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters — below section */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Filters</p>
              <div className="space-y-1">
                <button
                  onClick={() => setNeedRevisionMode(v => !v)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${needRevisionMode ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Need Revision</span>
                  {needRevisionMode && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 ml-auto" />}
                </button>
                <button
                  onClick={() => setNeedPracticeMode(v => !v)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${needPracticeMode ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Need Practice</span>
                  {needPracticeMode && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-auto" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Subject Overview</p>
              <div className="space-y-3">
                <OverviewRow icon={<BookOpen className="w-4 h-4" />} label="Chapters Completed" value={`${st.mastered} / ${st.total}`} />
                <OverviewRow icon={<CheckCircle2 className="w-4 h-4" />} label="Tasks Completed" value={`${st.topicsDone} / ${st.topicsTotal}`} />
                <OverviewRow icon={<ClipboardList className="w-4 h-4" />} label="Pending Revisions" value={st.revTotal.toString()} />
                <OverviewRow
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  label="Overall Progress" value={`${st.pct}%`}
                />
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${st.pct}%`, background: subject.color }} />
                </div>
              </div>
            </div>
            </div> {/* end px-6 pb-6 wrapper */}
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col lg:overflow-hidden px-4 lg:px-6 xl:px-10">
            {/* Sticky top section */}
            <div className="shrink-0 pt-0 pb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                <StatCard label="Doing" value={st.doing} dot="bg-blue-500" iconBig={<BookOpen className="w-4 h-4 text-blue-400" />} />
                <StatCard label="Mastered" value={st.mastered} dot="bg-green-500" iconBig={<CheckCircle2 className="w-4 h-4 text-green-400" />} />
                <StatCard label="Revisions" value={st.revTotal} dot="bg-yellow-500" iconBig={<RotateCcw className="w-4 h-4 text-yellow-400" />} />
                <StatCard label="Tasks" value={`${st.topicsDone}/${st.topicsTotal}`} dot="bg-purple-500" iconBig={<ClipboardList className="w-4 h-4 text-purple-400" />} />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
                  Chapters (Class {subject.classNum}){isChem && activeSec ? ` · ${CHEM_LABELS[activeSec]}` : ''}
                  {needRevisionMode && (
                    <button onClick={() => setNeedRevisionMode(false)} className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/25 transition-colors">
                      Need Revision <X className="w-3 h-3" />
                    </button>
                  )}
                  {needPracticeMode && (
                    <button onClick={() => setNeedPracticeMode(false)} className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 transition-colors">
                      Need Practice <X className="w-3 h-3" />
                    </button>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 lg:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search chapters..."
                      className="pl-10 pr-4 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 w-full lg:w-56"
                    />
                  </div>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors text-sm shrink-0"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable chapter list only */}
            <div className="flex-1 lg:overflow-y-auto pb-4 lg:pb-12">
              {filteredChapters.length === 0 && (needRevisionMode || needPracticeMode) && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  {needRevisionMode && !needPracticeMode && <RotateCcw className="w-8 h-8 text-yellow-400/40 mb-1" />}
                  {needPracticeMode && !needRevisionMode && <BookOpen className="w-8 h-8 text-blue-400/40 mb-1" />}
                  {needRevisionMode && needPracticeMode && <RotateCcw className="w-8 h-8 text-gray-600 mb-1" />}
                  <p className="text-gray-400 text-sm">
                    {needRevisionMode && needPracticeMode
                      ? 'No chapters match both filters'
                      : needRevisionMode
                      ? 'No chapters need revision'
                      : 'No chapters need practice'}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {needRevisionMode && needPracticeMode
                      ? 'Try removing one of the filters'
                      : needRevisionMode
                      ? 'Chapters marked as Doing or Mastered with 0 revisions will appear here'
                      : 'Chapters with Lectures completed will appear here'}
                  </p>
                </div>
              )}
              {filteredChapters.map((chapter, idx) => (
                <ChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  index={idx}
                  expanded={expandedChapter === chapter.id}
                  onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  onToggleDoing={() => toggleDoing(subject.id, chapter.id)}
                  onToggleMastered={() => toggleMastered(subject.id, chapter.id)}
                  onChangeRevisions={delta => changeRevisions(subject.id, chapter.id, delta)}
                  onToggleItem={itemId => toggleItem(subject.id, chapter.id, itemId)}
                  onAddItem={label => addItem(subject.id, chapter.id, label)}
                  onTaskContextMenu={(e, itemId, itemLabel, itemDone) => openCtx(e, itemId, itemLabel, itemDone, chapter.id)}
                  onDeleteItem={itemId => deleteItem(subject.id, chapter.id, itemId)}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-4 lg:mt-auto pt-4 pb-6 pb-[env(safe-area-inset-bottom)] border-t border-white/5 px-4 lg:px-6 xl:px-10 flex flex-col lg:flex-row items-center lg:justify-between gap-1 text-sm text-gray-500 text-center lg:text-left lg:shrink-0">
          <span>Nexus — Syllabus Tracking Platform for JEE Aspirants</span>
          
          <span>Designed &amp; Developed by Yoki</span>
        </footer>
      </main>

      {/* Context Menu */}
      {ctxMenu && (
        <div ref={ctxRef} className="fixed z-[9999] bg-[#13161f] border border-white/10 rounded-xl shadow-2xl overflow-hidden" style={{ top: ctxMenu.y, left: ctxMenu.x, minWidth: 200 }}>
          <div className="px-4 py-2.5 border-b border-white/5">
            <p className="text-white text-xs font-medium truncate">{ctxMenu.itemLabel}</p>
          </div>
          {copyStep === 'idle' ? (
            <div className="p-1">
              <button onClick={handleMarkDone} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
                <Check className="w-4 h-4 text-green-400" />
                {ctxMenu.itemDone ? 'Mark as Pending' : 'Mark as Done'}
              </button>
              <button onClick={() => setCopyStep('pick')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
                <Copy className="w-4 h-4 text-blue-400" /> Copy to Chapter…
              </button>
              <button onClick={handleCopyToAll} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
                <CopyCheck className="w-4 h-4 text-purple-400" /> Copy to All Chapters
              </button>
              <div className="my-1 border-t border-white/5" />
              <button onClick={handleDeleteItem} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> Remove Task
              </button>
            </div>
          ) : (
            <div className="p-1 max-h-64 overflow-y-auto">
              <button onClick={() => setCopyStep('idle')} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
              <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">Pick a chapter</p>
              {chapters.filter(c => c.id !== ctxMenu.chapterId).map(c => (
                <button key={c.id} onClick={() => handleCopyToChapter(c.id)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <EditChaptersModal
          subject={subject}
          chapters={chapters}
          activeSec={activeSec}
          onClose={() => setEditOpen(false)}
          onAdd={(title, desc) => addChapter(subject.id, title, desc, activeSec)}
          onDelete={chId => deleteChapter(subject.id, chId)}
          onRename={(chId, title, desc) => updateChapter(subject.id, chId, { title, desc })}
          onReorder={(fromIdx, toIdx) => reorderChapters(subject.id, fromIdx, toIdx, activeSec)}
        />
      )}
    </div>
  );
}

// ── Edit Chapters Modal ───────────────────────────────────────────────────────
function EditChaptersModal({ subject, chapters, activeSec, onClose, onAdd, onDelete, onRename, onReorder }: {
  subject: any; chapters: any[]; activeSec: any; onClose: () => void;
  onAdd: (title: string, desc: string) => void;
  onDelete: (chId: string) => void;
  onRename: (chId: string, title: string, desc: string) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newDesc.trim());
    setNewTitle(''); setNewDesc('');
  };

  const startEdit = (ch: any) => { setEditingId(ch.id); setEditTitle(ch.title); setEditDesc(ch.desc || ''); };
  const saveEdit = (chId: string) => { if (editTitle.trim()) onRename(chId, editTitle.trim(), editDesc.trim()); setEditingId(null); };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setOverIdx(idx); };
  const handleDrop = (toIdx: number) => {
    if (dragIdx !== null && dragIdx !== toIdx) onReorder(dragIdx, toIdx);
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0f1219] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-semibold text-lg">Edit Chapters</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {subject.name} · Class {subject.classNum}{activeSec ? ` · ${activeSec}` : ''}
              <span className="ml-2 text-gray-600">· drag <GripVertical className="w-3 h-3 inline" /> to reorder</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {chapters.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No chapters yet. Add one below.</p>
          )}
          {chapters.map((ch, idx) => (
            <div
              key={ch.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              className={`flex items-center gap-3 bg-[#1a1f2e] border rounded-xl px-4 py-3 transition-all select-none ${
                dragIdx === idx ? 'opacity-40' : ''
              } ${overIdx === idx && dragIdx !== idx ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5'}`}
            >
              <div className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <span className="text-gray-500 text-sm font-mono w-6 shrink-0">{String(idx + 1).padStart(2, '0')}</span>

              {editingId === ch.id ? (
                <div className="flex-1 flex flex-col gap-1.5">
                  <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(ch.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="w-full px-3 py-1.5 bg-[#0f1219] border border-purple-500/50 rounded-lg text-white text-sm focus:outline-none"
                    placeholder="Chapter title"
                  />
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(ch.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="w-full px-3 py-1.5 bg-[#0f1219] border border-white/10 rounded-lg text-gray-400 text-xs focus:outline-none"
                    placeholder="Description (optional)"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(ch.id)} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30 transition-colors">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ch.title}</p>
                  {ch.desc && <p className="text-gray-500 text-xs truncate">{ch.desc}</p>}
                </div>
              )}

              {editingId !== ch.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(ch)} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(ch.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#0d1018]">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Add New Chapter</p>
          <div className="flex gap-2 mb-2">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="Chapter title *"
              className="flex-1 px-3 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <button onClick={handleAdd} disabled={!newTitle.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-gray-400 text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/30"
          />
        </div>
      </div>
    </div>
  );
}

function OverviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-400 text-sm">{icon}<span>{label}</span></div>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}

function StatCard({ label, value, dot, iconBig }: { label: string; value: number | string; dot: string; iconBig: React.ReactNode }) {
  return (
    <div className="bg-[#0f1219] border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <span className="text-gray-400 text-xs sm:text-sm truncate">{label}</span>
      </div>
      <span className="text-white font-semibold text-base sm:text-lg">{value}</span>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{iconBig}</div>
    </div>
  );
}

function ChapterRow({
  chapter, index, expanded, onToggle,
  onToggleDoing, onToggleMastered, onChangeRevisions,
  onToggleItem, onAddItem, onTaskContextMenu, onDeleteItem,
}: {
  chapter: any; index: number; expanded: boolean;
  onToggle: () => void; onToggleDoing: () => void; onToggleMastered: () => void;
  onChangeRevisions: (delta: number) => void;
  onToggleItem: (id: string) => void;
  onAddItem: (label: string) => void;
  onTaskContextMenu: (e: React.MouseEvent, itemId: string, itemLabel: string, itemDone: boolean) => void;
  onDeleteItem: (id: string) => void;
}) {
  const [newTask, setNewTask] = useState('');
  const tasksDone = chapter.items.filter((i: any) => i.done).length;
  const tasksTotal = chapter.items.length;

  return (
    <div className="bg-[#0f1219] border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-start lg:items-center gap-3 lg:gap-4 px-4 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={onToggle}>
        <span className="text-gray-500 text-sm font-mono w-6 shrink-0 mt-0.5 lg:mt-0">{String(index + 1).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium">{chapter.title}</h4>
          {chapter.desc && <p className="text-gray-500 text-sm truncate">{chapter.desc}</p>}
          {/* Pills — shown below title on mobile, inline on sm+ */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 lg:hidden" onClick={e => e.stopPropagation()}>
            <button onClick={onToggleDoing} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${chapter.doing ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              Doing
            </button>
            <button onClick={onToggleMastered} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${chapter.mastered ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              Mastered
            </button>
            {chapter.revisions > 0 ? (
              <div className="flex items-center rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                <button onClick={() => onChangeRevisions(-1)} className="px-2 py-1 hover:bg-white/10 rounded-l-full transition-colors">−</button>
                <span className="px-1">Rev. {chapter.revisions}</span>
                <button onClick={() => onChangeRevisions(1)} className="px-2 py-1 hover:bg-white/10 rounded-r-full transition-colors">+</button>
              </div>
            ) : (
              <button onClick={() => onChangeRevisions(1)} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/20 transition-all">
                 Rev +
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tasksDone > 0 ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-gray-400'}`}>
              <ClipboardList className="w-3 h-3" /> {tasksDone}/{tasksTotal}
            </div>
          </div>
        </div>
        {/* Pills — desktop only, shown inline */}
        <div className="hidden lg:flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={onToggleDoing} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${chapter.doing ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            Doing
          </button>
          <button onClick={onToggleMastered} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${chapter.mastered ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            Mastered
          </button>
          {chapter.revisions > 0 ? (
          <div className="flex items-center rounded-full text-xs font-medium transition-all bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
            <button onClick={() => onChangeRevisions(-1)} className="px-2 py-1.5 hover:bg-white/10 rounded-l-full transition-colors" title="Decrease revisions">−</button>
            <span className="flex items-center gap-1.5 px-1 py-1.5 select-none">
              
              Rev. {chapter.revisions}
            </span>
            <button onClick={() => onChangeRevisions(1)} className="px-2 py-1.5 hover:bg-white/10 rounded-r-full transition-colors" title="Increase revisions">+</button>
          </div>
          ) : (
          <button onClick={() => onChangeRevisions(1)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/20 transition-all" title="Add revision">
            
            Rev +
          </button>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${tasksDone > 0 ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-gray-400'}`}>
            <ClipboardList className="w-3 h-3" />
            Tasks {tasksDone}/{tasksTotal}
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-3">Tasks</p>
          <div className="space-y-1 mb-4">
            {chapter.items.map((item: any) => (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id)}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.05] group transition-colors cursor-pointer"
                onContextMenu={e => { e.preventDefault(); onTaskContextMenu(e, item.id, item.label, item.done); }}
              >
                <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${item.done ? 'bg-purple-500 border-purple-500' : 'border-gray-600 group-hover:border-purple-400'}`}>
                  {item.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 select-none ${item.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {item.label}
                </span>
                {/* ··· button — right-most, always on touch, hover on desktop */}
                <button
                  onClick={e => { e.stopPropagation(); onTaskContextMenu(e, item.id, item.label, item.done); }}
                  className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/8 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                  title="More options"
                >
                  <span className="text-sm leading-none select-none tracking-widest">···</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteItem(item.id); }}
                  className={`transition-opacity w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/15 text-gray-600 hover:text-red-400 ${['Lectures', 'DPPs'].includes(item.label) ? 'invisible' : 'opacity-0 group-hover:opacity-100'}`}
                  title="Remove task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newTask.trim()) { onAddItem(newTask.trim()); setNewTask(''); } }}
              placeholder="Add new task..."
              className="flex-1 px-3 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <button
              onClick={() => { if (newTask.trim()) { onAddItem(newTask.trim()); setNewTask(''); } }}
              className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
