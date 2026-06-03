'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@/lib/store';
import { Pencil, Download, Upload, X, LogOut as LogOutIcon, Menu } from 'lucide-react';

interface NavBarProps {
  activeTab?: 'Dashboard' | 'Subjects' | 'Analytics';
}

export default function NavBar({ activeTab = 'Dashboard' }: NavBarProps) {
  const { setPage, user, logout, updateUser, resetAllProgress, syncPending } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const examDateStr = user?.examDate || '2027-01-20';
  const examName = user?.examName || 'JEE Main 2027';
  const jeeDate = new Date(`${examDateStr}T00:00:00`);
  const now = new Date();
  const diffMs = jeeDate.getTime() - now.getTime();
  const isPast = diffMs <= 0;
  const diffDays = isPast ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hours = isPast ? 0 : Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = isPast ? 0 : Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const tabs: { label: 'Dashboard' | 'Subjects' | 'Analytics'; page: 'home' | 'subjects' | 'analytics' }[] = [
    { label: 'Dashboard', page: 'home' },
    { label: 'Subjects', page: 'subjects' },
    { label: 'Analytics', page: 'analytics' },
  ];

  return (
    <>
      {/* ── Header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 sm:px-8 flex items-center justify-between bg-[#0a0d14]/95 backdrop-blur-xl border-b border-white/5">

        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-12">
          <button onClick={() => { setPage('home'); setMobileOpen(false); }} className="font-nexus text-2xl text-white">
            Nexus
          </button>
          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setPage(tab.page)}
                className={`relative px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.label ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.label && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-px bg-white/70 rounded-full shadow-[0_0_12px_4px_rgba(255,255,255,0.2)]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: desktop elements + mobile hamburger */}
        <div className="flex items-center gap-3">

          {/* Countdown pill — desktop only */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-[#13161f] rounded-lg border border-white/5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="leading-tight">
              <p className="text-gray-400 text-[11px] font-medium">{examName}</p>
              <p className="text-white font-bold text-sm tracking-wide">
                {isPast ? 'Exam Day!' : `${diffDays}D ${String(hours).padStart(2, '0')}H ${String(mins).padStart(2, '0')}M`}
              </p>
            </div>
          </div>

          {/* Sync + avatar — desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            {syncPending && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-gray-500 text-[11px]">Saving</span>
              </div>
            )}
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-white text-sm font-medium">{user?.name || 'Yoki'}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 z-40 bg-[#0a0d14]/98 backdrop-blur-xl border-b border-white/5 px-4 py-4 space-y-1">
          {/* Nav tabs */}
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setPage(tab.page); setMobileOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.label
                  ? 'bg-white/8 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              {activeTab === tab.label && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </button>
          ))}

          <div className="h-px bg-white/5 my-2" />

          {/* Countdown */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#13161f] rounded-xl border border-white/5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="leading-tight">
              <p className="text-gray-400 text-[11px] font-medium">{examName}</p>
              <p className="text-white font-bold text-sm tracking-wide">
                {isPast ? 'Exam Day!' : `${diffDays}D ${String(hours).padStart(2, '0')}H ${String(mins).padStart(2, '0')}M`}
              </p>
            </div>
            {syncPending && (
              <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-gray-500 text-[10px]">Saving</span>
              </div>
            )}
          </div>

          {/* Profile button */}
          <button
            onClick={() => { setMobileOpen(false); setShowProfile(true); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-white text-sm font-medium">{user?.name || 'Yoki'}</span>
          </button>
        </div>
      )}

      {showProfile && typeof document !== 'undefined' && createPortal(
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={updateUser}
          onLogout={() => { setShowProfile(false); logout(); }}
          onReset={resetAllProgress}
        />,
        document.body
      )}
    </>
  );
}

function ProfileModal({
  user, onClose, onUpdate, onLogout, onReset,
}: {
  user: any;
  onClose: () => void;
  onUpdate: (patch: any) => void;
  onLogout: () => void;
  onReset: () => void;
}) {
  const { importData, syncPending } = useStore();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name || 'Yoki');
  const [examNameVal, setExamNameVal] = useState(user?.examName || 'JEE Main 2027');
  const [editingExamName, setEditingExamName] = useState(false);
  const [examDateVal, setExamDateVal] = useState(user?.examDate || '2027-01-20');
  const [targetDateVal, setTargetDateVal] = useState(user?.targetDate || '');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveName = () => {
    if (nameVal.trim()) onUpdate({ name: nameVal.trim() });
    setEditingName(false);
  };

  const saveExamName = () => {
    onUpdate({ examName: examNameVal.trim() });
    setEditingExamName(false);
  };

  const saveExamDate = (val: string) => {
    setExamDateVal(val);
    onUpdate({ examDate: val });
  };

  const saveTargetDate = (val: string) => {
    setTargetDateVal(val);
    onUpdate({ targetDate: val });
  };

  const handleExport = () => {
    const state = useStore.getState();
    const data = {
      exportedAt: new Date().toISOString(),
      version: 1,
      user: state.user,
      subjects: state.subjects,
      progressHistory: state.progressHistory,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.subjects || !data.user) throw new Error('Invalid file');
        // importData saves to Firestore immediately — imported data becomes cloud source of truth
        await importData({ subjects: data.subjects, progressHistory: data.progressHistory || [], user: data.user });
        setImportStatus('success');
        setTimeout(() => { setImportStatus('idle'); onClose(); }, 1500);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[#0f1219] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

        {/* Sync indicator */}
        {syncPending && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-[10px] font-medium">Syncing...</span>
          </div>
        )}

        {/* Reset confirmation overlay */}
        {showResetConfirm && (
          <div className="absolute inset-0 z-10 bg-[#0f1219]/95 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white text-[15px] font-bold">Full Reset</h3>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">This is the <span className="text-red-500 font-semibold">nuclear option</span> — everything goes back to day one.</p>
            </div>

            <div className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl divide-y divide-white/[0.05] text-left">
              {[
                { label: 'All custom chapters you added', cleared: true },
                { label: 'All doing / mastered statuses', cleared: true },
                { label: 'All revision counts', cleared: true },
                { label: 'All task completions (Lectures, DPPs)', cleared: true },
                { label: 'Analytics progress history chart', cleared: true },
                { label: 'Your profile & exam settings', cleared: false },
                { label: 'Default syllabus chapters (restored)', cleared: false },
              ].map(({ label, cleared }) => (
                <div key={label} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${cleared ? 'bg-red-500/10 border border-red-500/25' : 'bg-white/5 border border-white/10'}`}>
                    {cleared ? (
                      <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-[12px] ${cleared ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
                  <span className={`ml-auto text-[10px] font-medium shrink-0 ${cleared ? 'text-red-500/70' : 'text-gray-600'}`}>
                    {cleared ? 'cleared' : 'kept'}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-[11px]">Cannot be undone — export your data first if needed.</p>

            <div className="flex gap-2.5 w-full">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 text-gray-400 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onReset(); setShowResetConfirm(false); setShowResetSuccess(true); }}
                className="flex-1 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-500 text-sm font-semibold rounded-xl transition-colors"
              >
                Yes, Full Reset
              </button>
            </div>
          </div>
        )}

        {/* Reset success overlay */}
        {showResetSuccess && (
          <div className="absolute inset-0 z-10 bg-[#0f1219]/95 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-white text-[15px] font-bold">Data Reset Successfully</h3>
              <p className="text-gray-500 text-sm leading-relaxed mt-1">
                All progress, revisions, and task completions cleared.<br />
                <span className="text-gray-600">You're starting fresh — good luck!</span>
              </p>
            </div>
            <button
              onClick={() => { setShowResetSuccess(false); onClose(); }}
              className="w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-500 text-sm font-medium rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {/* Close button */}
        <div className="relative px-8 pt-8 pb-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shrink-0">
              {nameVal[0]?.toUpperCase() || 'Y'}
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">{nameVal}</h2>
              <p className="text-gray-400 text-sm mt-0.5">Keep learning, keep growing.</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-5">

          {/* Username */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Username</p>
            <div onClick={() => !editingName && setEditingName(true)} className="flex items-center gap-3 px-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl cursor-pointer">
              {editingName ? (
                <input
                  autoFocus
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameVal(user?.name || 'Yoki'); setEditingName(false); } }}
                  onBlur={saveName}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                />
              ) : (
                <span className="flex-1 text-white text-sm">{nameVal}</span>
              )}
              <button onClick={e => { e.stopPropagation(); setEditingName(true); }} className="text-gray-500 hover:text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Exam Name */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Exam Name</p>
            <div onClick={() => !editingExamName && setEditingExamName(true)} className="flex items-center gap-3 px-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl cursor-pointer">
              {editingExamName ? (
                <input
                  autoFocus
                  value={examNameVal}
                  onChange={e => setExamNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveExamName(); if (e.key === 'Escape') setEditingExamName(false); }}
                  onBlur={saveExamName}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                  placeholder="e.g. JEE Main 2027"
                />
              ) : (
                <span className="flex-1 text-white text-sm">{examNameVal}</span>
              )}
              <button onClick={e => { e.stopPropagation(); setEditingExamName(true); }} className="text-gray-500 hover:text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Exam Date</p>
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl">
              <input
                type="date"
                value={examDateVal}
                onChange={e => saveExamDate(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none [color-scheme:dark] cursor-pointer"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1.5 pl-1">This updates the countdown in the navbar and dashboard.</p>
          </div>

          {/* Target Finish Date */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Target Finish Date</p>
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1f2e] border border-white/8 rounded-xl">
              <input
                type="date"
                value={targetDateVal}
                onChange={e => saveTargetDate(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none [color-scheme:dark] cursor-pointer"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1.5 pl-1">Your goal date to finish the syllabus.</p>
          </div>

          {/* Import / Export */}
          <div className="bg-[#1a1f2e] border border-white/8 rounded-xl p-4">
            <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-1">Import / Export Data</p>
            <p className="text-gray-400 text-xs mb-4">Export a backup of all your progress, subjects, and settings. Import to fully restore and sync to cloud.</p>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f1219] border border-white/10 rounded-xl text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                  importStatus === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' :
                  importStatus === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                  'bg-[#0f1219] border-white/10 text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-4 h-4" />
                {importStatus === 'success' ? 'Imported!' : importStatus === 'error' ? 'Invalid file' : 'Import'}
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            </div>
          </div>

          {/* Reset Progress */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1f2e] border border-white/8 hover:border-red-500/30 hover:bg-red-500/5 text-red-400 text-sm font-medium rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Progress
          </button>

          {/* Log Out */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a1f2e] border border-white/8 hover:border-red-500/30 hover:bg-red-500/5 text-red-400 text-sm font-medium rounded-xl transition-all"
          >
            <LogOutIcon className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
