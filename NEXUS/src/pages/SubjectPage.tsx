// src/pages/SubjectPage.tsx
import { useState, useCallback } from 'react';
import { useStore, subjectStats } from '../store';
import { Chapter, ChemSection } from '../types';
import { CHEM_SECTIONS, CHEM_LABELS } from '../data/seed';

/* ── Rev Counter ────────────────────────────────────────────────── */
function RevCounter({ value, onInc, onDec }: { value:number; onInc:()=>void; onDec:()=>void }) {
  const [pop, setPop] = useState(false);
  const handle = (fn: ()=>void) => { fn(); setPop(true); setTimeout(()=>setPop(false), 200); };
  return (
    <div className="flex items-center rounded-full border"
      style={{ borderColor:value>0?'rgba(251,191,36,0.3)':'var(--glass-border)', background:value>0?'rgba(251,191,36,0.07)':'transparent' }}>
      <button data-hover onClick={e=>{ e.stopPropagation(); handle(onDec); }}
        className="w-7 h-7 flex items-center justify-center text-sm transition-colors"
        style={{ color:'var(--t3)' }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='var(--revision)'}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='var(--t3)'}>−</button>
      <span className={`mono text-xs font-bold w-5 text-center transition-transform duration-150 ${pop?'scale-125':'scale-100'}`}
        style={{ color:value>0?'var(--revision)':'var(--t3)' }}>{value}</span>
      <button data-hover onClick={e=>{ e.stopPropagation(); handle(onInc); }}
        className="w-7 h-7 flex items-center justify-center text-sm transition-colors"
        style={{ color:'var(--t3)' }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='var(--revision)'}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='var(--t3)'}>+</button>
      {value>0 && <span className="text-xs mono pr-2" style={{ color:'rgba(251,191,36,0.5)', fontSize:9 }}>rev</span>}
    </div>
  );
}

/* ── Context Menu ───────────────────────────────────────────────── */
function CtxMenu({ x, y, children, onClose }: { x:number; y:number; children:React.ReactNode; onClose:()=>void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="ctx-menu fixed z-50 py-1.5 min-w-48"
        style={{ left:Math.min(x, window.innerWidth-210), top:Math.min(y, window.innerHeight-300) }}>
        {children}
      </div>
    </>
  );
}
function CtxItem({ icon, label, color, onClick }: { icon:string; label:string; color?:string; onClick:()=>void }) {
  return (
    <button data-hover onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-all duration-100 rounded-lg mx-1"
      style={{ color:color||'var(--t2)', width:'calc(100% - 8px)' }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color=color||'var(--t1)'; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color=color||'var(--t2)'; }}>
      <span className="w-4 text-center opacity-70">{icon}</span>{label}
    </button>
  );
}
function CtxSep() { return <div className="my-1 mx-3" style={{ height:1, background:'var(--line)' }} />; }

/* ── Chapter Row ────────────────────────────────────────────────── */
function ChapterRow({
  ch, idx, subId, accentColor, openChId, onToggleOpen, dragHandlers,
}: {
  ch:Chapter; idx:number; subId:string; accentColor:string;
  openChId:string|null; onToggleOpen:(id:string)=>void;
  dragHandlers:{ onDragStart:(i:number)=>void; onDragOver:(i:number)=>void; onDrop:()=>void; dragging:number|null; dragOver:number|null };
}) {
  const open = openChId === ch.id;
  const [addVal, setAddVal]             = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(ch.title);
  const [ctxMenu, setCtxMenu]           = useState<{ x:number; y:number; itemId?:string }|null>(null);

  const { toggleDoing, toggleMastered, changeRevisions, addItem, toggleItem, deleteItem,
          copyItemToChapter, copyItemToAllChapters, deleteChapter, updateChapter, subjects } = useStore();

  const subject    = subjects.find(s => s.id === subId)!;
  const isDragging = dragHandlers.dragging === idx;
  const isDragOver = dragHandlers.dragOver === idx;

  const commitTitle = () => {
    if (titleDraft.trim()) updateChapter(subId, ch.id, { title:titleDraft.trim() });
    setEditingTitle(false);
  };

  const pct = ch.mastered ? 100 : ch.doing ? 50 : 0;
  const borderL = pct===100 ? 'var(--mastered)' : pct===50 ? 'var(--doing)' : 'rgba(255,255,255,0.08)';

  const getCopyTargets = (label:string) =>
    subject.chapters.filter(c => c.id!==ch.id && !c.items.some(i=>i.label===label));

  const handleAddItem = () => { if (!addVal.trim()) return; addItem(subId, ch.id, addVal.trim()); setAddVal(''); };

  return (
    <>
      <div
        draggable
        onDragStart={()=>dragHandlers.onDragStart(idx)}
        onDragOver={e=>{ e.preventDefault(); dragHandlers.onDragOver(idx); }}
        onDrop={dragHandlers.onDrop}
        className={`chapter-row rounded-xl mb-2 ${isDragging?'dragging':''} ${isDragOver?'drag-over':''}`}
        style={{
          background: open
            ? 'linear-gradient(140deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.025) 100%)'
            : 'linear-gradient(140deg,rgba(255,255,255,0.045) 0%,rgba(255,255,255,0.015) 100%)',
          border:`1px solid ${isDragOver?accentColor:open?'var(--glass-border-bright)':'var(--glass-border)'}`,
          borderLeft:`3px solid ${borderL}`,
          backdropFilter:'blur(12px)',
        }}>

        {/* Header row */}
        <div className="ch-head flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 select-none" data-hover
          onClick={()=>onToggleOpen(ch.id)}>

          <div className="drag-handle text-xs shrink-0" style={{ color:'var(--t4)', opacity:0.45 }}
            onMouseDown={e=>e.stopPropagation()}>⠿</div>

          <span className="mono text-xs shrink-0 w-6 text-right" style={{ color:'var(--t4)' }}>
            {String(idx+1).padStart(2,'0')}
          </span>

          {/* Title */}
          <div className="flex-1 min-w-0" onClick={e=>e.stopPropagation()}>
            {editingTitle ? (
              <input autoFocus value={titleDraft}
                onChange={e=>setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e=>{ if(e.key==='Enter') commitTitle(); if(e.key==='Escape'){setTitleDraft(ch.title);setEditingTitle(false);} }}
                className="w-full bg-transparent text-sm font-medium outline-none border-b pb-0.5"
                style={{ color:'var(--t1)', borderColor:accentColor }} />
            ) : (
              <p className="text-sm font-medium truncate" style={{ color:'var(--t1)' }}>{ch.title}</p>
            )}
            {ch.desc && <p className="text-xs mono mt-0.5 truncate" style={{ color:'var(--t3)' }}>{ch.desc}</p>}
          </div>

          {/* Controls — wrap on small screens */}
          <div className="ch-controls-wrap flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end" onClick={e=>e.stopPropagation()}>
            <button data-hover onClick={()=>toggleDoing(subId,ch.id)}
              className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${ch.doing?'pill-doing':''}`}
              style={!ch.doing?{border:'1px solid var(--glass-border)',color:'var(--t3)'}:{}}>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background:ch.doing?'var(--doing)':'var(--t4)', boxShadow:ch.doing?'0 0 6px var(--doing)':'none' }} />
                Doing
              </span>
            </button>
            <button data-hover onClick={()=>toggleMastered(subId,ch.id)}
              className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${ch.mastered?'pill-mastered':''}`}
              style={!ch.mastered?{border:'1px solid var(--glass-border)',color:'var(--t3)'}:{}}>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background:ch.mastered?'var(--mastered)':'var(--t4)', boxShadow:ch.mastered?'0 0 6px var(--mastered)':'none' }} />
                Mastered
              </span>
            </button>
            <RevCounter value={ch.revisions||0}
              onInc={()=>changeRevisions(subId,ch.id,1)}
              onDec={()=>changeRevisions(subId,ch.id,-1)} />
            {/* Tasks toggle */}
            <button data-hover onClick={e=>{ e.stopPropagation(); onToggleOpen(ch.id); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={{ border:open?`1px solid ${accentColor}55`:'1px solid var(--glass-border)',
                       color:open?accentColor:'var(--t3)', background:open?accentColor+'12':'transparent' }}>
              ☑ Tasks
              {ch.items.length>0 && (
                <span className="mono text-xs" style={{ color:open?accentColor:'var(--t4)' }}>
                  {ch.items.filter(i=>i.done).length}/{ch.items.length}
                </span>
              )}
            </button>
            {/* ⋯ more menu */}
            <button data-hover onClick={e=>{ e.stopPropagation(); setCtxMenu({x:e.clientX,y:e.clientY}); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 mono font-bold"
              style={{ color:'var(--t3)', fontSize:16 }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color='var(--t1)'; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='var(--t3)'; }}>
              ⋯
            </button>
          </div>

          <span className="text-xs shrink-0 transition-transform duration-200"
            style={{ color:'var(--t4)', transform:open?'rotate(180deg)':'rotate(0deg)' }}>▾</span>
        </div>

        {/* Tasks body */}
        {open && (
          <div className="px-3 sm:px-4 pb-4 pt-2" style={{ borderTop:'1px solid var(--line)' }}>
            <p className="text-xs mono mb-2.5" style={{ color:'var(--t4)', letterSpacing:'1px', textTransform:'uppercase', fontSize:9 }}>Study Tasks</p>
            {ch.items.length===0 ? (
              <p className="text-xs mono py-2 italic" style={{ color:'var(--t4)' }}>No tasks yet — add one below</p>
            ) : (
              <div className="flex flex-col gap-0.5 mb-3">
                {ch.items.map(it => (
                  <div key={it.id}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg group/item transition-all duration-150"
                    onContextMenu={e=>{ e.preventDefault(); setCtxMenu({x:e.clientX,y:e.clientY,itemId:it.id}); }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <button data-hover onClick={()=>toggleItem(subId,ch.id,it.id)}
                      className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border transition-all duration-200"
                      style={it.done
                        ?{background:'var(--accent)',borderColor:'var(--accent)',boxShadow:'0 0 6px rgba(232,103,60,0.3)'}
                        :{borderColor:'var(--glass-border-bright)',background:'transparent'}}>
                      {it.done && <span style={{ color:'#fff', fontSize:8, fontWeight:800 }}>✓</span>}
                    </button>
                    <span className="flex-1 text-xs" style={{ color:it.done?'var(--t4)':'var(--t2)', textDecoration:it.done?'line-through':'none' }}>
                      {it.label}
                    </span>
                    {/* Always visible delete on touch; hover-only on desktop */}
                    <button data-hover onClick={()=>deleteItem(subId,ch.id,it.id)}
                      className="item-del-btn opacity-0 group-hover/item:opacity-40 hover:!opacity-100 text-xs transition-opacity"
                      style={{ color:'#f87171' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2" style={{ borderTop:'1px solid var(--line)' }}>
              <input value={addVal} onChange={e=>setAddVal(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') handleAddItem(); }}
                placeholder="Add task…"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)', color:'var(--t1)' }} />
              <button data-hover onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ background:'rgba(232,103,60,0.12)', border:'1px solid rgba(232,103,60,0.2)', color:'var(--accent)' }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='var(--accent)'; (e.currentTarget as HTMLElement).style.color='#fff'; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(232,103,60,0.12)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}>
                + Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <CtxMenu x={ctxMenu.x} y={ctxMenu.y} onClose={()=>setCtxMenu(null)}>
          {ctxMenu.itemId ? (() => {
            const item    = ch.items.find(i=>i.id===ctxMenu.itemId)!;
            const targets = item ? getCopyTargets(item.label) : [];
            return (
              <>
                <p className="px-3.5 py-1.5 text-xs mono" style={{ color:'var(--t4)' }}>{item?.label?.slice(0,28)}</p>
                <CtxSep />
                <CtxItem icon="✓" label={item?.done?'Mark undone':'Mark done'} color="var(--doing)"
                  onClick={()=>{ toggleItem(subId,ch.id,ctxMenu.itemId!); setCtxMenu(null); }} />
                <CtxSep />
                {targets.length>0 ? (
                  <>
                    <p className="px-3.5 pt-1 pb-0.5 text-xs mono" style={{ color:'var(--t4)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.8px' }}>
                      Copy to chapter
                    </p>
                    {targets.map(t => (
                      <CtxItem key={t.id} icon="⎘" label={t.title.slice(0,26)}
                        onClick={()=>{ copyItemToChapter(subId,ch.id,ctxMenu.itemId!,t.id); setCtxMenu(null); }} />
                    ))}
                    <CtxSep />
                    <CtxItem icon="⎘" label={`Copy to all (${targets.length} ch)`} color="var(--accent)"
                      onClick={()=>{ copyItemToAllChapters(subId,ch.id,ctxMenu.itemId!); setCtxMenu(null); }} />
                  </>
                ) : (
                  <p className="px-3.5 py-2 text-xs mono" style={{ color:'var(--t4)' }}>No copy targets</p>
                )}
                <CtxSep />
                <CtxItem icon="✕" label="Delete" color="#f87171"
                  onClick={()=>{ deleteItem(subId,ch.id,ctxMenu.itemId!); setCtxMenu(null); }} />
              </>
            );
          })() : (
            <>
              <CtxItem icon="✎" label="Rename chapter" onClick={()=>{ setEditingTitle(true); onToggleOpen(ch.id); setCtxMenu(null); }} />
              <CtxSep />
              <CtxItem icon="⚡" label="Toggle Doing"    color="var(--doing)"    onClick={()=>{ toggleDoing(subId,ch.id);    setCtxMenu(null); }} />
              <CtxItem icon="🏆" label="Toggle Mastered" color="var(--mastered)" onClick={()=>{ toggleMastered(subId,ch.id); setCtxMenu(null); }} />
              <CtxSep />
              <CtxItem icon="✕" label="Delete chapter" color="#f87171" onClick={()=>{ deleteChapter(subId,ch.id); setCtxMenu(null); }} />
            </>
          )}
        </CtxMenu>
      )}
    </>
  );
}

/* ── SubjectPage ─────────────────────────────────────────────────── */
export default function SubjectPage() {
  const { subjects, currentSubId, currentChemSection, addChapter, reorderChapters, setPage } = useStore();
  const [addTitle, setAddTitle] = useState('');
  const [dragging, setDragging] = useState<number|null>(null);
  const [dragOver, setDragOver] = useState<number|null>(null);
  const [openChId, setOpenChId] = useState<string|null>(null);

  const openSec = useStore(st => st.openSubject);
  const s = subjects.find(sub => sub.id === currentSubId);
  if (!s) return null;

  const isChem    = s.type === 'chemistry';
  const activeSec = isChem ? (currentChemSection || 'Physical') : null;
  const chapters  = activeSec ? s.chapters.filter(c=>c.chemSection===activeSec) : s.chapters;
  const st        = subjectStats(s, activeSec);

  const handleToggleOpen = useCallback((id:string) => setOpenChId(prev=>prev===id?null:id), []);

  const handleDrop = () => {
    if (dragging!==null && dragOver!==null && dragging!==dragOver)
      reorderChapters(s.id, dragging, dragOver, activeSec);
    setDragging(null); setDragOver(null);
  };

  const handleAdd = () => { if (!addTitle.trim()) return; addChapter(s.id, addTitle.trim(), '', activeSec); setAddTitle(''); };

  return (
    <div className="h-full flex flex-col" style={{ background:'transparent' }}>

      {/* Top bar */}
      <div className="shrink-0 px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4 flex-wrap"
        style={{ borderBottom:'1px solid var(--glass-border)', background:'rgba(8,11,20,0.7)', backdropFilter:'blur(20px)' }}>
        <button data-hover onClick={()=>setPage('home')}
          className="text-xs mono px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 shrink-0"
          style={{ color:'var(--t3)', border:'1px solid var(--glass-border)' }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color='var(--t1)'; (e.currentTarget as HTMLElement).style.borderColor='var(--glass-border-bright)'; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color='var(--t3)'; (e.currentTarget as HTMLElement).style.borderColor='var(--glass-border)'; }}>
          ← Back
        </button>

        <div className="hidden sm:block" style={{ width:1, height:20, background:'var(--line)' }} />

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm sm:text-base shrink-0"
            style={{ background:`${s.color}22`, color:s.color }}>{s.icon}</div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color:'var(--t1)' }}>{s.name}</p>
            <p className="text-xs mono" style={{ color:'var(--t3)' }}>Class {s.classNum} · {chapters.length} ch</p>
          </div>
        </div>

        {/* Stats chips — hidden on mobile to save space */}
        <div className="subj-stat-chips hidden sm:flex items-center gap-2 flex-wrap">
          {[
            { label:'Doing',     val:st.doing,   color:'var(--doing)' },
            { label:'Mastered',  val:st.mastered, color:'var(--mastered)' },
            { label:'Revisions', val:st.revTotal, color:'var(--revision)' },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--glass-border)' }}>
              <span className="text-xs font-bold mono" style={{ color:chip.color }}>{chip.val}</span>
              <span className="text-xs mono" style={{ color:'var(--t3)' }}>· {chip.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${st.pct}%`, background:`linear-gradient(90deg,var(--doing),${s.color})` }} />
            </div>
            <span className="text-xs mono font-bold" style={{ color:s.color }}>{st.pct}%</span>
          </div>
        </div>

        {/* Compact progress on mobile */}
        <div className="flex sm:hidden items-center gap-2 ml-auto">
          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${st.pct}%`, background:`linear-gradient(90deg,var(--doing),${s.color})` }} />
          </div>
          <span className="text-xs mono font-bold" style={{ color:s.color }}>{st.pct}%</span>
        </div>
      </div>

      {/* Chem tabs */}
      {isChem && (
        <div className="shrink-0 flex px-2 sm:px-6 overflow-x-auto" style={{ borderBottom:'1px solid var(--glass-border)', background:'rgba(8,11,20,0.5)' }}>
          {CHEM_SECTIONS.map((sec, i) => {
            const cols = ['var(--doing)', 'var(--mastered)', 'var(--violet)'];
            const isAct = activeSec === sec;
            return (
              <button key={sec} data-hover onClick={()=>openSec(s.id, sec)}
                className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all duration-200 whitespace-nowrap shrink-0"
                style={{ borderColor:isAct?cols[i]:'transparent', color:isAct?'var(--t1)':'var(--t3)' }}>
                {CHEM_LABELS[sec]}
              </button>
            );
          })}
        </div>
      )}

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 text-xs mono flex-wrap" style={{ color:'var(--t3)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background:'var(--doing)' }} />Doing = 50%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background:'var(--mastered)' }} />Mastered = 100%
          </span>
          <span className="hidden sm:inline ml-auto opacity-60">drag ⠿ to reorder · ⋯ to manage</span>
        </div>

        {chapters.length===0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 dashed-border">
            <span className="text-3xl opacity-30">📭</span>
            <p className="text-sm" style={{ color:'var(--t3)' }}>No chapters yet</p>
          </div>
        ) : (
          chapters.map((ch, idx) => (
            <ChapterRow key={ch.id} ch={ch} idx={idx} subId={s.id} accentColor={s.color}
              openChId={openChId} onToggleOpen={handleToggleOpen}
              dragHandlers={{ onDragStart:setDragging, onDragOver:setDragOver, onDrop:handleDrop, dragging, dragOver }} />
          ))
        )}

        {/* Add chapter — stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <input value={addTitle} onChange={e=>setAddTitle(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') handleAdd(); }}
            placeholder="Add new chapter…"
            className="flex-1 text-sm px-4 py-2.5 rounded-xl"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--glass-border)', color:'var(--t1)' }} />
          <button data-hover onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background:'linear-gradient(135deg,var(--accent),#f472b6)', color:'#fff', boxShadow:'0 0 20px rgba(232,103,60,0.2)' }}>
            + Add Chapter
          </button>
        </div>
      </div>
    </div>
  );
}
