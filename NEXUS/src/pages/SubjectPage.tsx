// src/pages/SubjectPage.tsx
import { useState, useCallback } from 'react';
import { useStore, subjectStats } from '../store';
import { Chapter, ChemSection } from '../types';
import { CHEM_SECTIONS, CHEM_LABELS } from '../data/seed';

// ── Rev Counter ──────────────────────────────────────────────────────────────
function RevCounter({ value, onInc, onDec }: { value: number; onInc: () => void; onDec: () => void }) {
  const [pop, setPop] = useState(false);
  const handle = (fn: () => void) => { fn(); setPop(true); setTimeout(() => setPop(false), 200); };
  return (
    <div className={`flex items-center rounded-full border transition-all duration-200 ${value > 0 ? 'border-yellow-500/30' : 'border-white/8'}`}
      style={{ background: value > 0 ? 'rgba(251,191,36,0.07)' : 'transparent' }}>
      <button onClick={(e) => { e.stopPropagation(); handle(onDec); }} data-hover
        className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors hover:text-yellow-400"
        style={{ color: 'var(--t3)' }}>−</button>
      <span className={`mono text-xs font-bold w-5 text-center transition-transform duration-150 ${pop ? 'scale-125' : 'scale-100'}`}
        style={{ color: value > 0 ? 'var(--revision)' : 'var(--t3)' }}>{value}</span>
      <button onClick={(e) => { e.stopPropagation(); handle(onInc); }} data-hover
        className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors hover:text-yellow-400"
        style={{ color: 'var(--t3)' }}>+</button>
      {value > 0 && <span className="text-xs mono pr-2" style={{ color: 'rgba(251,191,36,0.5)', fontSize: 9 }}>rev</span>}
    </div>
  );
}

// ── Context Menu ─────────────────────────────────────────────────────────────
function CtxMenu({ x, y, children, onClose }: { x: number; y: number; children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="ctx-menu fixed z-50 py-1.5 min-w-48"
        style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 280) }}>
        {children}
      </div>
    </>
  );
}
function CtxItem({ icon, label, color, onClick }: { icon: string; label: string; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} data-hover
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-all duration-100 rounded-lg mx-1"
      style={{ color: color || 'var(--t2)', width: 'calc(100% - 8px)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = color || 'var(--t1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = color || 'var(--t2)'; }}>
      <span className="w-4 text-center opacity-70">{icon}</span>
      {label}
    </button>
  );
}
function CtxSep() { return <div className="my-1 mx-3" style={{ height: 1, background: 'var(--line)' }} />; }

// ── Chapter Row ──────────────────────────────────────────────────────────────
function ChapterRow({
  ch, idx, subId, accentColor, openChId, onToggleOpen, dragHandlers,
}: {
  ch: Chapter; idx: number; subId: string; accentColor: string;
  openChId: string | null; onToggleOpen: (id: string) => void;
  dragHandlers: { onDragStart: (i: number) => void; onDragOver: (i: number) => void; onDrop: () => void; dragging: number | null; dragOver: number | null; };
}) {
  const open = openChId === ch.id;

  const [addVal, setAddVal] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(ch.title);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; itemId?: string } | null>(null);

  const { toggleDoing, toggleMastered, changeRevisions, addItem, toggleItem, deleteItem,
          copyItemToChapter, copyItemToAllChapters, deleteChapter, updateChapter, subjects } = useStore();

  const subject = subjects.find(s => s.id === subId)!;
  const isDragging = dragHandlers.dragging === idx;
  const isDragOver = dragHandlers.dragOver === idx;

  const commitTitle = () => {
    if (titleDraft.trim()) updateChapter(subId, ch.id, { title: titleDraft.trim() });
    setEditingTitle(false);
  };

  const pct = ch.mastered ? 100 : ch.doing ? 50 : 0;

  const getCopyTargets = (label: string) =>
    subject.chapters.filter(c => c.id !== ch.id && !c.items.some(i => i.label === label));

  const handleAddItem = () => {
    if (!addVal.trim()) return;
    addItem(subId, ch.id, addVal.trim());
    setAddVal('');
  };

  return (
    <>
      <div
        draggable
        onDragStart={() => dragHandlers.onDragStart(idx)}
        onDragOver={(e) => { e.preventDefault(); dragHandlers.onDragOver(idx); }}
        onDrop={dragHandlers.onDrop}
        className={`chapter-row rounded-xl mb-2 transition-all duration-200 ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
        style={{
          background: 'var(--bg2)',
          border: `1px solid ${isDragOver ? accentColor : 'var(--line)'}`,
          borderLeft: `3px solid ${pct === 100 ? 'var(--mastered)' : pct === 50 ? 'var(--doing)' : 'var(--line)'}`,
        }}>

        {/* Header */}
        <div className="ch-head flex items-center gap-3 px-4 py-3.5 select-none" data-hover
          onClick={() => onToggleOpen(ch.id)}>

          <div className="drag-handle text-xs shrink-0" style={{ color: 'var(--t4)', fontSize: 12 }}
            onMouseDown={e => e.stopPropagation()}>⠿</div>

          <span className="mono text-xs shrink-0 w-6 text-right" style={{ color: 'var(--t4)' }}>
            {String(idx + 1).padStart(2, '0')}
          </span>

          {/* Title — single click to edit via context, double-click still works */}
          <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
            {editingTitle ? (
              <input autoFocus value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setTitleDraft(ch.title); setEditingTitle(false); } }}
                className="w-full bg-transparent text-sm font-medium outline-none border-b pb-0.5"
                style={{ color: 'var(--t1)', borderColor: accentColor }} />
            ) : (
              <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}
                onDoubleClick={e => { e.stopPropagation(); setEditingTitle(true); }}>
                {ch.title}
              </p>
            )}
            {ch.desc && <p className="text-xs truncate mono mt-0.5" style={{ color: 'var(--t3)' }}>{ch.desc}</p>}
          </div>

          {/* Status controls */}
          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
            <button data-hover onClick={() => toggleDoing(subId, ch.id)}
              className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-200 ${ch.doing ? 'pill-doing' : ''}`}
              style={!ch.doing ? { border: '1px solid var(--line2)', color: 'var(--t3)' } : {}}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: ch.doing ? 'var(--doing)' : 'var(--t4)', boxShadow: ch.doing ? '0 0 6px var(--doing)' : 'none' }} />
                Doing
              </span>
            </button>

            <button data-hover onClick={() => toggleMastered(subId, ch.id)}
              className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-200 ${ch.mastered ? 'pill-mastered' : ''}`}
              style={!ch.mastered ? { border: '1px solid var(--line2)', color: 'var(--t3)' } : {}}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: ch.mastered ? 'var(--mastered)' : 'var(--t4)', boxShadow: ch.mastered ? '0 0 6px var(--mastered)' : 'none' }} />
                Mastered
              </span>
            </button>

            <RevCounter value={ch.revisions || 0}
              onInc={() => changeRevisions(subId, ch.id, 1)}
              onDec={() => changeRevisions(subId, ch.id, -1)} />

            {/* Tasks button — opens section directly */}
            <button data-hover
              onClick={e => { e.stopPropagation(); onToggleOpen(ch.id); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                border: open ? `1px solid ${accentColor}60` : '1px solid var(--line2)',
                color: open ? accentColor : 'var(--t3)',
                background: open ? accentColor + '10' : 'transparent',
              }}>
              ☑ Tasks
              {ch.items.length > 0 && (
                <span className="mono text-xs" style={{ color: open ? accentColor : 'var(--t4)' }}>
                  {ch.items.filter(i => i.done).length}/{ch.items.length}
                </span>
              )}
            </button>

            {/* More */}
            <button data-hover onClick={e => { e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg4)'; (e.currentTarget as HTMLElement).style.color = 'var(--t1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--t3)'; }}>
              ⋯
            </button>
          </div>

          <span className="text-xs shrink-0 transition-transform duration-200"
            style={{ color: 'var(--t4)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </div>

        {/* Tasks body */}
        {open && (
          <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--line)' }}>
            <p className="text-xs mono mb-2" style={{ color: 'var(--t4)', letterSpacing: '0.8px', textTransform: 'uppercase', fontSize: 9 }}>Study Tasks</p>
            {ch.items.length === 0 ? (
              <p className="text-xs mono py-2 italic" style={{ color: 'var(--t4)' }}>No tasks yet — add below</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {ch.items.map(it => (
                  <div key={it.id}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg group/item transition-all duration-150"
                    onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, itemId: it.id }); }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <button data-hover onClick={() => toggleItem(subId, ch.id, it.id)}
                      className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border transition-all duration-200"
                      style={it.done
                        ? { background: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 0 6px rgba(232,103,60,0.3)' }
                        : { borderColor: 'var(--line2)', background: 'transparent' }}>
                      {it.done && <span style={{ color: '#fff', fontSize: 8, fontWeight: 800 }}>✓</span>}
                    </button>
                    <span className="flex-1 text-xs" style={{ color: it.done ? 'var(--t4)' : 'var(--t2)', textDecoration: it.done ? 'line-through' : 'none' }}>
                      {it.label}
                    </span>
                    <button data-hover onClick={() => deleteItem(subId, ch.id, it.id)}
                      className="opacity-0 group-hover/item:opacity-40 hover:!opacity-100 text-xs transition-opacity"
                      style={{ color: '#f87171' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {/* Add task */}
            <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
              <input value={addVal} onChange={e => setAddVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
                placeholder="Add task…"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--bg4)', border: '1px solid var(--line)', color: 'var(--t1)' }} />
              <button data-hover onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ background: 'rgba(232,103,60,0.12)', border: '1px solid rgba(232,103,60,0.2)', color: 'var(--accent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,103,60,0.12)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}>
                + Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <CtxMenu x={ctxMenu.x} y={ctxMenu.y} onClose={() => setCtxMenu(null)}>
          {ctxMenu.itemId ? (() => {
            const item = ch.items.find(i => i.id === ctxMenu.itemId)!;
            const targets = item ? getCopyTargets(item.label) : [];
            return (
              <>
                <p className="px-3.5 py-1.5 text-xs mono" style={{ color: 'var(--t4)' }}>{item?.label?.slice(0, 28)}</p>
                <CtxSep />
                <CtxItem icon="✓" label={item?.done ? 'Mark undone' : 'Mark done'} color="var(--doing)"
                  onClick={() => { toggleItem(subId, ch.id, ctxMenu.itemId!); setCtxMenu(null); }} />
                <CtxSep />
                {targets.length > 0 ? (
                  <>
                    <p className="px-3.5 pt-1 pb-0.5 text-xs mono" style={{ color: 'var(--t4)', fontSize: 9, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                      Copy to chapter (same subject)
                    </p>
                    {targets.map(t => (
                      <CtxItem key={t.id} icon="⎘" label={t.title.slice(0, 26)}
                        onClick={() => { copyItemToChapter(subId, ch.id, ctxMenu.itemId!, t.id); setCtxMenu(null); }} />
                    ))}
                    <CtxSep />
                    <CtxItem icon="⎘⎘" label={`Copy to all (${targets.length} chapters)`} color="var(--accent)"
                      onClick={() => { copyItemToAllChapters(subId, ch.id, ctxMenu.itemId!); setCtxMenu(null); }} />
                  </>
                ) : (
                  <p className="px-3.5 py-2 text-xs mono" style={{ color: 'var(--t4)' }}>No valid copy targets</p>
                )}
                <CtxSep />
                <CtxItem icon="✕" label="Delete" color="#f87171"
                  onClick={() => { deleteItem(subId, ch.id, ctxMenu.itemId!); setCtxMenu(null); }} />
              </>
            );
          })() : (
            <>
              <CtxItem icon="✎" label="Edit title" onClick={() => { setEditingTitle(true); onToggleOpen(ch.id); setCtxMenu(null); }} />
              <CtxItem icon="⚡" label="Set Doing"    color="var(--doing)"    onClick={() => { toggleDoing(subId, ch.id);    setCtxMenu(null); }} />
              <CtxItem icon="🏆" label="Set Mastered" color="var(--mastered)" onClick={() => { toggleMastered(subId, ch.id); setCtxMenu(null); }} />
              <CtxSep />
              <CtxItem icon="✕" label="Delete chapter" color="#f87171" onClick={() => { deleteChapter(subId, ch.id); setCtxMenu(null); }} />
            </>
          )}
        </CtxMenu>
      )}
    </>
  );
}

// ── SubjectPage ───────────────────────────────────────────────────────────────
export default function SubjectPage() {
  const { subjects, currentSubId, currentChemSection, addChapter, reorderChapters, setPage } = useStore();
  const [addTitle, setAddTitle]     = useState('');
  const [dragging, setDragging]     = useState<number | null>(null);
  const [dragOver, setDragOver]     = useState<number | null>(null);
  const [openChId, setOpenChId]     = useState<string | null>(null);

  const s = subjects.find(sub => sub.id === currentSubId);
  if (!s) return null;

  const isChem   = s.type === 'chemistry';
  const activeSec = isChem ? (currentChemSection || 'Physical') : null;
  const chapters  = activeSec ? s.chapters.filter(c => c.chemSection === activeSec) : s.chapters;
  const st        = subjectStats(s, activeSec);
  const openSec   = useStore((st) => st.openSubject);

  // Accordion: only one open at a time
  const handleToggleOpen = useCallback((id: string) => {
    setOpenChId(prev => prev === id ? null : id);
  }, []);

  const handleDrop = () => {
    if (dragging !== null && dragOver !== null && dragging !== dragOver) {
      reorderChapters(s.id, dragging, dragOver, activeSec);
    }
    setDragging(null); setDragOver(null);
  };

  const handleAdd = () => {
    if (!addTitle.trim()) return;
    addChapter(s.id, addTitle.trim(), '', activeSec);
    setAddTitle('');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg0)' }}>

      {/* Top bar */}
      <div className="shrink-0 px-8 py-4 flex items-center gap-4 border-b"
        style={{ borderColor: 'var(--line)', background: 'rgba(6,6,8,0.9)', backdropFilter: 'blur(12px)' }}>
        <button data-hover onClick={() => setPage('home')}
          className="text-xs mono px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{ color: 'var(--t3)', border: '1px solid var(--line)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t1)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--line2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t3)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; }}>
          ← Back
        </button>

        <div className="w-px h-5" style={{ background: 'var(--line)' }} />

        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--t1)' }}>{s.name}</p>
            <p className="text-xs mono" style={{ color: 'var(--t3)' }}>Class {s.classNum}</p>
          </div>
        </div>

        {/* Stats as chips */}
        <div className="flex items-center gap-2">
          {[
            { label: 'Doing',     val: st.doing,    color: 'var(--doing)' },
            { label: 'Mastered',  val: st.mastered,  color: 'var(--mastered)' },
            { label: 'Revisions', val: st.revTotal,  color: 'var(--revision)' },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'var(--bg3)', border: '1px solid var(--line)' }}>
              <span className="text-xs font-bold mono" style={{ color: chip.color }}>{chip.val}</span>
              <span className="text-xs" style={{ color: 'var(--t3)' }}>·</span>
              <span className="text-xs mono" style={{ color: 'var(--t3)' }}>{chip.label}</span>
            </div>
          ))}

          <div className="w-24 h-1.5 rounded-full overflow-hidden ml-2" style={{ background: 'var(--bg5)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${st.pct}%`, background: `linear-gradient(90deg, var(--doing), ${s.color})` }} />
          </div>
          <span className="text-xs mono font-bold" style={{ color: s.color }}>{st.pct}%</span>
        </div>
      </div>

      {/* Chemistry section tabs */}
      {isChem && (
        <div className="shrink-0 flex border-b px-8" style={{ borderColor: 'var(--line)', background: 'var(--bg1)' }}>
          {CHEM_SECTIONS.map((sec, i) => {
            const secColors = ['var(--doing)', 'var(--mastered)', 'var(--violet)'];
            const isAct = activeSec === sec;
            return (
              <button key={sec} data-hover onClick={() => openSec(s.id, sec)}
                className="px-5 py-3 text-xs font-medium border-b-2 transition-all duration-200"
                style={{ borderColor: isAct ? secColors[i] : 'transparent', color: isAct ? 'var(--t1)' : 'var(--t3)' }}>
                {CHEM_LABELS[sec]}
              </button>
            );
          })}
        </div>
      )}

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        <div className="flex items-center gap-4 mb-4 text-xs mono" style={{ color: 'var(--t3)' }}>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--doing)' }}></span>Doing = 50%</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--mastered)' }}></span>Mastered = 100%</span>
          <span className="ml-auto opacity-60">drag ⠿ to reorder · click title to edit</span>
        </div>

        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 dashed-border">
            <span className="text-3xl opacity-30">📭</span>
            <p className="text-sm" style={{ color: 'var(--t3)' }}>No chapters yet</p>
          </div>
        ) : (
          <div>
            {chapters.map((ch, idx) => (
              <ChapterRow key={ch.id} ch={ch} idx={idx} subId={s.id} accentColor={s.color}
                openChId={openChId} onToggleOpen={handleToggleOpen}
                dragHandlers={{ onDragStart: setDragging, onDragOver: setDragOver, onDrop: handleDrop, dragging, dragOver }} />
            ))}
          </div>
        )}

        {/* Add chapter */}
        <div className="flex gap-2 mt-3">
          <input value={addTitle} onChange={e => setAddTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Add new chapter…"
            className="flex-1 text-sm px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--t1)' }} />
          <button data-hover onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, var(--accent), #f472b6)', color: '#fff', boxShadow: '0 0 16px rgba(232,103,60,0.25)' }}>
            + Add Chapter
          </button>
        </div>
      </div>
    </div>
  );
}
