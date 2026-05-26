// tracker.js — full application logic

let currentSubId      = null;
let currentChemSection = null;
let editChTarget      = null;
let selColor          = PALETTE[0];
let currentPage       = 'home';

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.body.style.cursor = 'none';
seed();
renderSidebar();
showHome();

// Modal keyboard shortcuts
['mc_title','ms_name','ech_title'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (id === 'mc_title')  saveNewChapter();
    if (id === 'ms_name')   saveNewSubject();
    if (id === 'ech_title') saveEditChapter();
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    closeCtx();
  }
});
document.getElementById('addSubjectModal')?.addEventListener('transitionend', function() {
  if (this.classList.contains('open')) buildColorPicker();
});

// Close ctx on any click outside
document.addEventListener('click', () => closeCtx());
document.addEventListener('contextmenu', e => {
  if (!e.target.closest('.item-row')) e.preventDefault();
});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function renderSidebar() {
  const el = document.getElementById('subjectList');
  if (!el) return;
  let html = '';
  [11, 12].forEach(cls => {
    const subs = db.subjects.filter(s => s.classNum === cls);
    if (!subs.length) return;
    const gid = 'g' + cls;
    const collapsed = localStorage.getItem(gid + 'c') === '1';
    html += `<div class="class-group${collapsed ? ' collapsed' : ''}" id="${gid}">
      <div class="class-group-label" onclick="toggleGroup('${gid}')">
        <span>Class ${cls}</span><span class="cgl-arrow">▾</span>
      </div>
      <div class="class-group-items">`;
    subs.forEach(s => {
      const st   = subStats(s);
      const isAct = s.id === currentSubId;
      const dotStyle = `background:${s.color}22;color:${s.color}`;
      const tabStyle = `--tab-color:${s.color};--tab-glow:${s.color}44`;
      if (isChem(s)) {
        html += `<div class="subj-tab chem-parent" style="${tabStyle}">
          <div class="st-badge" style="${dotStyle}">${s.icon || '⚗'}</div>
          <span class="st-name">${escH(s.name)}</span>
        </div>
        <div>`;
        CHEM_SECTIONS.forEach(sec => {
          const ss     = subStats(s, sec);
          const secAct = isAct && currentChemSection === sec;
          html += `<div class="subj-tab chem-child${secAct ? ' active' : ''}" style="${tabStyle}" onclick="openSub('${s.id}','${sec}')">
            <div class="st-badge" style="${dotStyle};width:22px;height:22px;font-size:9px;border-radius:5px">${CHEM_SHORT[sec]}</div>
            <span class="st-name">${sec.split(' ')[0]}&nbsp;Chem</span>
            <span class="st-pct">${ss.pct}%</span>
          </div>`;
        });
        html += `</div>`;
      } else {
        html += `<div class="subj-tab${isAct ? ' active' : ''}" style="${tabStyle}" onclick="openSub('${s.id}',null)">
          <div class="st-badge" style="${dotStyle}">${s.icon || '📘'}</div>
          <span class="st-name">${escH(s.name)}<span style="color:var(--t4);font-size:9px"> ·${cls}</span></span>
          <span class="st-pct">${st.pct}%</span>
        </div>`;
      }
    });
    html += `</div></div>`;
  });
  el.innerHTML = html || '<p style="padding:10px 4px;font-size:11px;color:var(--t4);font-family:JetBrains Mono,monospace">no subjects yet</p>';
}

function toggleGroup(gid) {
  const el = document.getElementById(gid);
  el.classList.toggle('collapsed');
  localStorage.setItem(gid + 'c', el.classList.contains('collapsed') ? '1' : '0');
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────
function showHome() {
  currentPage = 'home'; currentSubId = null; currentChemSection = null;
  setPage('home');
  document.getElementById('topbar').style.display = 'none';
  setNavActive('nav-dash');
  renderSidebar();
  renderHome();
}

function renderHome() {
  const gs  = globalStats();
  const all = db.subjects;

  let html = `
  <div class="home-greeting">
    <div class="hg-eyebrow">JEE · 2026</div>
    <h1 class="hg-title">Your <span class="accent">Command Center.</span></h1>
    <p class="hg-sub">Track every chapter. Revise smart. Ace the exam.</p>
  </div>

  <div class="hero-grid">
    <div class="hero-card" style="--hc-color:var(--orange)">
      <div class="hc-glow" style="background:var(--orange)"></div>
      <div class="hc-label">Overall Progress</div>
      <div class="hc-val" style="color:var(--orange)">${gs.pct}<span style="font-size:18px;color:var(--t2)">%</span></div>
      <div class="hc-sub">${gs.scored} / ${gs.total * 2} pts scored</div>
      <div class="hc-bar"><div class="hc-bar-fill" style="width:${gs.pct}%;background:linear-gradient(90deg,var(--orange),var(--rose))"></div></div>
    </div>
    <div class="hero-card" style="--hc-color:var(--doing-c)">
      <div class="hc-glow" style="background:var(--cyan)"></div>
      <div class="hc-label">In Progress</div>
      <div class="hc-val" style="color:var(--cyan)">${gs.doing}</div>
      <div class="hc-sub">chapters being studied</div>
      <div class="hc-bar"><div class="hc-bar-fill" style="width:${gs.total ? gs.doing/gs.total*100 : 0}%;background:var(--doing-c)"></div></div>
    </div>
    <div class="hero-card" style="--hc-color:var(--mastered-c)">
      <div class="hc-glow" style="background:var(--lime)"></div>
      <div class="hc-label">Mastered</div>
      <div class="hc-val" style="color:var(--lime)">${gs.mastered}</div>
      <div class="hc-sub">chapters fully owned</div>
      <div class="hc-bar"><div class="hc-bar-fill" style="width:${gs.total ? gs.mastered/gs.total*100 : 0}%;background:var(--mastered-c)"></div></div>
    </div>
    <div class="hero-card" style="--hc-color:var(--revision-c)">
      <div class="hc-glow" style="background:var(--amber)"></div>
      <div class="hc-label">Revisions Done</div>
      <div class="hc-val" style="color:var(--amber)">${gs.revTotal}</div>
      <div class="hc-sub">total revision rounds</div>
      <div class="hc-bar"><div class="hc-bar-fill" style="width:${Math.min(100,gs.revTotal/Math.max(gs.total,1)*10)}%;background:var(--revision-c)"></div></div>
    </div>
  </div>`;

  [11, 12].forEach(cls => {
    const subs = db.subjects.filter(s => s.classNum === cls);
    if (!subs.length) return;
    html += `<div class="section-title">Class ${cls}</div><div class="subjects-grid">`;
    subs.forEach(s => {
      const st = subStats(s);
      const target = isChem(s) ? `openSub('${s.id}','Physical Chemistry')` : `openSub('${s.id}',null)`;
      html += `<div class="subj-overview-card" style="--card-color:${s.color}" onclick="${target}">
        <div class="soc-top">
          <div class="soc-icon" style="background:${s.color}18;color:${s.color}">${s.icon || '📘'}</div>
          <div>
            <div class="soc-name">${escH(s.name)}</div>
            <div class="soc-meta">Class ${cls} · ${st.total} chapters</div>
          </div>
        </div>
        <div class="soc-bars">
          <div class="soc-bar-row">
            <span class="soc-bar-lbl">Doing</span>
            <div class="soc-bar-track"><div class="soc-bar-fill" style="width:${st.total?st.doing/st.total*100:0}%;background:var(--doing-c)"></div></div>
            <span class="soc-val" style="color:var(--doing-c)">${st.doing}</span>
          </div>
          <div class="soc-bar-row">
            <span class="soc-bar-lbl">Mastered</span>
            <div class="soc-bar-track"><div class="soc-bar-fill" style="width:${st.total?st.mastered/st.total*100:0}%;background:var(--mastered-c)"></div></div>
            <span class="soc-val" style="color:var(--mastered-c)">${st.mastered}</span>
          </div>
          <div class="soc-bar-row">
            <span class="soc-bar-lbl">Revisions</span>
            <div class="soc-bar-track"><div class="soc-bar-fill" style="width:${Math.min(100,st.revTotal/10*100)}%;background:var(--revision-c)"></div></div>
            <span class="soc-val" style="color:var(--revision-c)">${st.revTotal}×</span>
          </div>
        </div>
        <div class="soc-pct-badge" style="color:${s.color}">${st.pct}%</div>
      </div>`;
    });
    html += `</div>`;
  });

  document.getElementById('page-home').innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT VIEW
// ─────────────────────────────────────────────────────────────────────────────
function openSub(subId, chemSection) {
  currentSubId = subId; currentChemSection = chemSection; currentPage = 'subject';
  setPage('content');
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('nav-dash').classList.remove('active');
  document.getElementById('nav-analytics').classList.remove('active');
  renderSidebar();
  renderSubjectView();
}

function renderSubjectView() {
  const s = getSub(currentSubId); if (!s) return;
  const chemMode  = isChem(s);
  const activeSec = chemMode ? currentChemSection : null;
  const st        = subStats(s, activeSec);
  const chs       = activeSec ? s.chapters.filter(c => c.chemSection === activeSec) : s.chapters;

  // Topbar
  const tb  = document.getElementById('topbar');
  document.getElementById('tb-breadcrumb').textContent = `JEE › Class ${s.classNum} › ${s.name}${activeSec ? ' › ' + CHEM_SHORT[activeSec] : ''}`;
  const dot = document.getElementById('tb-dot');
  dot.style.background  = s.color;
  dot.style.boxShadow   = `0 0 8px ${s.color}`;
  document.getElementById('tb-title').textContent = activeSec || s.name;
  document.getElementById('tb-meta').textContent  = `${st.doing} doing · ${st.mastered} mastered · ${st.revTotal} revisions`;
  const doing_w   = st.total ? st.doing    / st.total * 100 : 0;
  const mastered_w = st.total ? st.mastered / st.total * 100 : 0;
  document.getElementById('tpb-doing').style.flex    = doing_w;
  document.getElementById('tpb-mastered').style.flex = mastered_w;

  // Content
  let html = '';
  if (chemMode) {
    const secColors = { 'Physical Chemistry':'var(--cyan)', 'Organic Chemistry':'var(--lime)', 'Inorganic Chemistry':'var(--violet)' };
    html += `<div class="section-tabs">
      ${CHEM_SECTIONS.map(sec => `<div class="section-tab${currentChemSection===sec?' active':''}"
        style="--sec-color:${secColors[sec]}" onclick="openSub('${s.id}','${sec}')">${sec}</div>`).join('')}
    </div>`;
  }

  html += `<div class="legend">
    <div class="leg-i"><div class="leg-dot" style="background:var(--doing-c)"></div>Doing</div>
    <div class="leg-i"><div class="leg-dot" style="background:var(--mastered-c)"></div>Mastered</div>
    <div class="leg-i"><div class="leg-dot" style="background:var(--revision-c)"></div>Revisions</div>
  </div>`;

  if (!chs.length) {
    html += `<div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div>No chapters yet</div>
      <div class="empty-hint" onclick="openAddChapterModal()">+ Add your first chapter</div>
    </div>`;
    document.getElementById('page-content').innerHTML = html;
    return;
  }

  html += `<div class="chapter-grid">`;
  chs.forEach((ch, idx) => {
    const hasRev = (ch.revisions || 0) > 0;
    const items  = ch.items || [];
    const itemsHtml = items.length
      ? items.map(it => `<div class="item-row" id="ir-${it.id}" oncontextmenu="openItemCtx(event,'${s.id}','${ch.id}','${it.id}')">
          <div class="item-cb${it.done?' on':''}" onclick="toggleItem('${s.id}','${ch.id}','${it.id}')"></div>
          <span class="item-lbl${it.done?' done':''}">${escH(it.label)}</span>
          <button class="item-del" onclick="delItem('${s.id}','${ch.id}','${it.id}')" title="remove">×</button>
        </div>`).join('')
      : '<div class="empty-ch">no subtopics — add below</div>';

    html += `<div class="ch-card${ch.open?' open':''}" id="chc-${ch.id}" style="--ch-color:${s.color};--ch-glow:${s.color}55">
      <div class="ch-head" onclick="toggleCh('${ch.id}')">
        <span class="ch-num">${String(idx+1).padStart(2,'0')}</span>
        <div class="ch-info">
          <div class="ch-name">${escH(ch.title)}</div>
          ${ch.desc ? `<div class="ch-desc">${escH(ch.desc)}</div>` : ''}
        </div>
        <div class="ch-status" onclick="event.stopPropagation()">
          <div class="status-pill doing${ch.doing?' on':''}" onclick="toggleDoing('${s.id}','${ch.id}')">
            <div class="sp-dot" style="background:var(--doing-c)"></div>Doing
          </div>
          <div class="status-pill mastered${ch.mastered?' on':''}" onclick="toggleMastered('${s.id}','${ch.id}')">
            <div class="sp-dot" style="background:var(--mastered-c)"></div>Mastered
          </div>
          <div class="rev-ctrl${hasRev?' lit':''}">
            <button class="rev-btn" onclick="changeRev('${s.id}','${ch.id}',-1)">−</button>
            <div class="rev-num" id="revn-${ch.id}">${ch.revisions||0}</div>
            <div class="rev-lbl">rev</div>
            <button class="rev-btn" onclick="changeRev('${s.id}','${ch.id}',+1)">+</button>
          </div>
        </div>
        <div class="ch-right">
          <button class="ch-more" onclick="event.stopPropagation();openChCtx(event,'${s.id}','${ch.id}')">⋯</button>
          <span class="ch-arrow">▾</span>
        </div>
      </div>
      <div class="ch-body">
        <div id="ci-${ch.id}">${itemsHtml}</div>
        <div class="add-row">
          <input class="add-input" id="ai-${ch.id}" placeholder="add subtopic…" onkeydown="if(event.key==='Enter')addItem('${s.id}','${ch.id}')">
          <button class="add-btn" onclick="addItem('${s.id}','${ch.id}')">+ Add</button>
        </div>
      </div>
    </div>`;
  });
  html += '</div>';
  document.getElementById('page-content').innerHTML = html;
}

function toggleCh(id) {
  const card = document.getElementById('chc-' + id); if (!card) return;
  card.classList.toggle('open');
  const s = getSub(currentSubId);
  const ch = s?.chapters.find(c => c.id === id);
  if (ch) { ch.open = card.classList.contains('open'); save(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER STATUS
// ─────────────────────────────────────────────────────────────────────────────
function toggleDoing(subId, chId) {
  const s = getSub(subId), ch = s.chapters.find(c => c.id === chId);
  ch.doing = !ch.doing;
  if (ch.doing) ch.mastered = false;
  save(); patchChapterPills(ch); refreshTopbar(s);
}
function toggleMastered(subId, chId) {
  const s = getSub(subId), ch = s.chapters.find(c => c.id === chId);
  ch.mastered = !ch.mastered;
  if (ch.mastered) ch.doing = false;
  save(); patchChapterPills(ch); refreshTopbar(s);
}
function changeRev(subId, chId, delta) {
  const s = getSub(subId), ch = s.chapters.find(c => c.id === chId);
  ch.revisions = Math.max(0, (ch.revisions || 0) + delta); save();
  const numEl = document.getElementById('revn-' + chId);
  if (numEl) {
    numEl.textContent = ch.revisions;
    numEl.classList.remove('pop');
    void numEl.offsetWidth; // reflow
    numEl.classList.add('pop');
    numEl.closest('.rev-ctrl')?.classList.toggle('lit', ch.revisions > 0);
  }
  refreshTopbar(s);
}
function patchChapterPills(ch) {
  const card = document.getElementById('chc-' + ch.id); if (!card) return;
  card.querySelector('.status-pill.doing')?.classList.toggle('on', ch.doing);
  card.querySelector('.status-pill.mastered')?.classList.toggle('on', ch.mastered);
}
function refreshTopbar(s) {
  const sec = isChem(s) ? currentChemSection : null;
  const st  = subStats(s, sec);
  document.getElementById('tb-meta').textContent = `${st.doing} doing · ${st.mastered} mastered · ${st.revTotal} revisions`;
  const chs = sec ? s.chapters.filter(c => c.chemSection === sec) : s.chapters;
  document.getElementById('tpb-doing').style.flex    = chs.length ? st.doing    / chs.length * 100 : 0;
  document.getElementById('tpb-mastered').style.flex = chs.length ? st.mastered / chs.length * 100 : 0;
  renderSidebar();
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEMS
// ─────────────────────────────────────────────────────────────────────────────
function toggleItem(subId, chId, itemId) {
  const s = getSub(subId), ch = s.chapters.find(c=>c.id===chId), it = ch.items.find(i=>i.id===itemId);
  it.done = !it.done; save();
  document.querySelector('#ir-'+itemId+' .item-cb')?.classList.toggle('on', it.done);
  document.querySelector('#ir-'+itemId+' .item-lbl')?.classList.toggle('done', it.done);
}
function addItem(subId, chId) {
  const inp = document.getElementById('ai-' + chId);
  const label = inp.value.trim(); if (!label) return;
  const s = getSub(subId), ch = s.chapters.find(c=>c.id===chId);
  if (!ch.items) ch.items = [];
  const item = { id:uid(), label, done:false };
  ch.items.push(item); save(); inp.value = '';
  const container = document.getElementById('ci-' + chId);
  if (container) {
    container.querySelector('.empty-ch')?.remove();
    const div = document.createElement('div');
    div.className = 'item-row'; div.id = 'ir-' + item.id;
    div.setAttribute('oncontextmenu', `openItemCtx(event,'${subId}','${chId}','${item.id}')`);
    div.innerHTML = `<div class="item-cb" onclick="toggleItem('${subId}','${chId}','${item.id}')"></div>
      <span class="item-lbl">${escH(item.label)}</span>
      <button class="item-del" onclick="delItem('${subId}','${chId}','${item.id}')" title="remove">×</button>`;
    container.appendChild(div);
  }
}
function delItem(subId, chId, itemId) {
  const s = getSub(subId), ch = s.chapters.find(c=>c.id===chId);
  ch.items = ch.items.filter(i=>i.id!==itemId); save();
  document.getElementById('ir-'+itemId)?.remove();
  const ci = document.getElementById('ci-' + chId);
  if (ci && !ch.items.length) ci.innerHTML = '<div class="empty-ch">no subtopics — add below</div>';
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY ITEM — same subject only, no duplicate labels
// ─────────────────────────────────────────────────────────────────────────────
function buildCopyTargets(fromSubId, fromChId, label) {
  const s = getSub(fromSubId); if (!s) return [];
  return s.chapters
    .filter(ch => ch.id !== fromChId)                          // not the source chapter
    .filter(ch => !(ch.items||[]).find(it => it.label === label)) // no duplicate label
    .map(ch => ({ chId: ch.id, chTitle: ch.title, color: s.color, subId: s.id }));
}

function copyItemTo(itemId, fromSubId, toChId) {
  let found = null;
  db.subjects.forEach(s => s.chapters.forEach(ch => (ch.items||[]).forEach(it => { if(it.id===itemId) found = it; })));
  if (!found) return;
  const s = getSub(fromSubId), toCh = s.chapters.find(c => c.id === toChId);
  if (!toCh) return;
  if ((toCh.items||[]).find(i => i.label === found.label)) { showToast('Already exists there'); return; }
  if (!toCh.items) toCh.items = [];
  toCh.items.push({ id:uid(), label:found.label, done:false }); save();
  showToast(`Copied to "${toCh.title}"`);
  // refresh DOM if visible
  const ci = document.getElementById('ci-' + toChId);
  if (ci) {
    ci.querySelector('.empty-ch')?.remove();
    const newIt = toCh.items[toCh.items.length-1];
    const div = document.createElement('div');
    div.className = 'item-row'; div.id = 'ir-' + newIt.id;
    div.setAttribute('oncontextmenu', `openItemCtx(event,'${fromSubId}','${toChId}','${newIt.id}')`);
    div.innerHTML = `<div class="item-cb" onclick="toggleItem('${fromSubId}','${toChId}','${newIt.id}')"></div>
      <span class="item-lbl">${escH(newIt.label)}</span>
      <button class="item-del" onclick="delItem('${fromSubId}','${toChId}','${newIt.id}')" title="remove">×</button>`;
    ci.appendChild(div);
  }
}

function copyItemToAll(itemId, fromSubId, fromChId, label) {
  const targets = buildCopyTargets(fromSubId, fromChId, label);
  if (!targets.length) { showToast('No other chapters to copy to'); return; }
  targets.forEach(t => copyItemTo(itemId, fromSubId, t.chId));
  showToast(`Copied to ${targets.length} chapter${targets.length > 1 ? 's' : ''}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT MENUS
// ─────────────────────────────────────────────────────────────────────────────
const ctxEl = document.getElementById('ctxMenu');
function posCtx(e) {
  ctxEl.classList.add('open');
  const x = Math.min(e.clientX + 4, window.innerWidth - 224);
  const y = Math.min(e.clientY + 4, window.innerHeight - 280);
  ctxEl.style.left = x + 'px';
  ctxEl.style.top  = y + 'px';
}
function closeCtx() { ctxEl?.classList.remove('open'); }

function openItemCtx(e, subId, chId, itemId) {
  e.preventDefault(); e.stopPropagation();
  let found = null;
  db.subjects.forEach(s => s.chapters.forEach(ch => (ch.items||[]).forEach(it => { if(it.id===itemId) found=it; })));
  if (!found) return;
  const targets = buildCopyTargets(subId, chId, found.label);
  const subItemsHtml = targets.length
    ? targets.map(t => `<div class="ctx-sub-item" onclick="copyItemTo('${itemId}','${subId}','${t.chId}');closeCtx()">
        <div class="csi-dot" style="background:${t.color}"></div>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escH(t.chTitle)}</span>
      </div>`).join('')
    : '<div class="ctx-sub-empty">No valid targets (no duplicates allowed)</div>';

  const copyAllLabel = `Copy to all chapters (${targets.length})`;

  ctxEl.innerHTML = `<div class="ctx-hdr">${escH(found.label).slice(0,32)}</div>
    <div class="ctx-item cyan" onclick="toggleItem('${subId}','${chId}','${itemId}');closeCtx()">
      <span class="ctx-ic">${found.done?'○':'✓'}</span>${found.done?'Mark undone':'Mark done'}
    </div>
    <div class="ctx-sep"></div>
    <div class="ctx-sub-wrap">
      <div class="ctx-item orange">
        <span class="ctx-ic">⎘</span>Copy to chapter…
        <span style="margin-left:auto;color:var(--t4);font-size:10px">▶</span>
      </div>
      <div class="ctx-submenu">
        <div class="ctx-sub-hdr">Same subject only · no duplicates</div>
        ${subItemsHtml}
      </div>
    </div>
    <div class="ctx-item orange" onclick="copyItemToAll('${itemId}','${subId}','${chId}','${escH(found.label)}');closeCtx()">
      <span class="ctx-ic">⎘⎘</span>${copyAllLabel}
    </div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" onclick="delItem('${subId}','${chId}','${itemId}');closeCtx()">
      <span class="ctx-ic">✕</span>Delete
    </div>`;
  posCtx(e);
}

function openChCtx(e, subId, chId) {
  e.stopPropagation();
  const s = getSub(subId), ch = s.chapters.find(c=>c.id===chId);
  ctxEl.innerHTML = `
    <div class="ctx-item" onclick="editCh('${subId}','${chId}');closeCtx()"><span class="ctx-ic">✎</span>Edit chapter</div>
    <div class="ctx-item cyan" onclick="markDoing('${subId}','${chId}');closeCtx()"><span class="ctx-ic">⚡</span>Set Doing</div>
    <div class="ctx-item" style="color:var(--lime)" onclick="markMastered('${subId}','${chId}');closeCtx()"><span class="ctx-ic">🏆</span>Set Mastered</div>
    <div class="ctx-item" onclick="resetCh('${subId}','${chId}');closeCtx()"><span class="ctx-ic">↺</span>Reset status</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" onclick="deleteCh('${subId}','${chId}');closeCtx()"><span class="ctx-ic">✕</span>Delete chapter</div>`;
  posCtx(e);
}

function showSubjectCtx(e) {
  ctxEl.innerHTML = `
    <div class="ctx-item" onclick="document.querySelectorAll('.ch-card').forEach(c=>c.classList.add('open'));closeCtx()">
      <span class="ctx-ic">↓</span>Expand all</div>
    <div class="ctx-item" onclick="document.querySelectorAll('.ch-card').forEach(c=>c.classList.remove('open'));closeCtx()">
      <span class="ctx-ic">↑</span>Collapse all</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="resetSubProgress();closeCtx()"><span class="ctx-ic">↺</span>Reset all progress</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item danger" onclick="deleteSub();closeCtx()"><span class="ctx-ic">✕</span>Delete subject</div>`;
  posCtx(e);
}

function markDoing(subId, chId)    { const s=getSub(subId),ch=s.chapters.find(c=>c.id===chId); ch.doing=true; ch.mastered=false; save(); patchChapterPills(ch); refreshTopbar(s); }
function markMastered(subId, chId) { const s=getSub(subId),ch=s.chapters.find(c=>c.id===chId); ch.mastered=true; ch.doing=false; save(); patchChapterPills(ch); refreshTopbar(s); }
function resetCh(subId, chId)      { const s=getSub(subId),ch=s.chapters.find(c=>c.id===chId); ch.doing=false; ch.mastered=false; ch.revisions=0; save(); patchChapterPills(ch); const n=document.getElementById('revn-'+chId); if(n){n.textContent='0'; n.closest('.rev-ctrl')?.classList.remove('lit');} refreshTopbar(s); }
function deleteCh(subId, chId)     { if(!confirm('Delete this chapter?')) return; const s=getSub(subId); s.chapters=s.chapters.filter(c=>c.id!==chId); save(); renderSubjectView(); }
function resetSubProgress()        { if(!confirm('Reset all chapter statuses?')) return; const s=getSub(currentSubId); s.chapters.forEach(ch=>{ch.doing=false;ch.mastered=false;ch.revisions=0;}); save(); renderSubjectView(); }
function deleteSub()               { const s=getSub(currentSubId); if(!confirm(`Delete "${s.name}"?`)) return; db.subjects=db.subjects.filter(x=>x.id!==currentSubId); save(); showHome(); }
function editCh(subId, chId)       { const s=getSub(subId),ch=s.chapters.find(c=>c.id===chId); editChTarget={subId,chId}; document.getElementById('ech_title').value=ch.title; document.getElementById('ech_desc').value=ch.desc||''; openModal('editChapterModal'); }
function saveEditChapter()         { const {subId,chId}=editChTarget; const s=getSub(subId),ch=s.chapters.find(c=>c.id===chId); const t=document.getElementById('ech_title').value.trim(); if(t)ch.title=t; ch.desc=document.getElementById('ech_desc').value.trim(); save(); closeModal('editChapterModal'); renderSubjectView(); }

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
function showAnalytics() {
  currentPage = 'analytics'; currentSubId = null; currentChemSection = null;
  setPage('analytics');
  document.getElementById('topbar').style.display = 'none';
  setNavActive('nav-analytics');
  renderSidebar();
  renderAnalytics();
}

function renderAnalytics() {
  const gs  = globalStats();
  const c11 = classStats(11), c12 = classStats(12);
  const weak = [], needRev = [];

  db.subjects.forEach(s => s.chapters.forEach(ch => {
    const o = { subId:s.id, chId:ch.id, subName:s.name, chName:ch.title, color:s.color, cls:s.classNum };
    if (!ch.doing && !ch.mastered) weak.push(o);
    if (ch.doing && !ch.mastered && !(ch.revisions||0)) needRev.push(o);
  }));

  const flagList = (items, badge, cls) => items.length
    ? items.map(f => `<div class="flag-item" onclick="openSub('${f.subId}',null)">
        <div class="fi-dot" style="background:${f.color}"></div>
        <div class="fi-info">
          <div class="fi-name">${escH(f.chName)}</div>
          <div class="fi-sub">${escH(f.subName)} · Cl${f.cls}</div>
        </div>
        <span class="fi-badge ${cls}">${badge}</span>
      </div>`).join('')
    : `<div class="no-flags">🎉 None!</div>`;

  let html = `
  <div class="analytics-title">Analytics</div>
  <div class="analytics-sub">Full breakdown of your JEE preparation.</div>

  <div class="metrics-row">
    <div class="metric-card" style="--mc-color:var(--orange)">
      <div class="mc-icon">🎯</div>
      <div class="mc-val">${gs.pct}<span style="font-size:16px;color:var(--t2)">%</span></div>
      <div class="mc-label">Overall Score</div>
      <div class="mc-sub">${gs.scored} / ${gs.total*2} pts</div>
    </div>
    <div class="metric-card" style="--mc-color:var(--doing-c)">
      <div class="mc-icon">⚡</div>
      <div class="mc-val" style="color:var(--doing-c)">${gs.doing}</div>
      <div class="mc-label">In Progress</div>
      <div class="mc-sub">of ${gs.total} chapters</div>
    </div>
    <div class="metric-card" style="--mc-color:var(--mastered-c)">
      <div class="mc-icon">🏆</div>
      <div class="mc-val" style="color:var(--lime)">${gs.mastered}</div>
      <div class="mc-label">Mastered</div>
      <div class="mc-sub">${gs.total ? Math.round(gs.mastered/gs.total*100) : 0}% of syllabus</div>
    </div>
    <div class="metric-card" style="--mc-color:var(--revision-c)">
      <div class="mc-icon">🔄</div>
      <div class="mc-val" style="color:var(--amber)">${gs.revTotal}</div>
      <div class="mc-label">Revisions</div>
      <div class="mc-sub">avg ${gs.total ? (gs.revTotal/gs.total).toFixed(1) : 0} / ch</div>
    </div>
  </div>

  <div class="an-section">
    <div class="an-title">Class-wise Breakdown</div>
    <div class="class-breakdown">
      ${[{cls:11,st:c11},{cls:12,st:c12}].map(({cls,st}) => {
        const subs = db.subjects.filter(s=>s.classNum===cls);
        const col  = st.pct>70?'var(--lime)':st.pct>40?'var(--cyan)':'var(--t2)';
        return `<div class="breakdown-card">
          <div class="bc-title">Class ${cls} <span class="bc-badge">${st.total} chapters</span></div>
          <div class="bc-nums">
            <div class="bc-num-item"><div class="bc-num-val" style="color:var(--doing-c)">${st.doing}</div><div class="bc-num-lbl">Doing</div></div>
            <div class="bc-num-item"><div class="bc-num-val" style="color:var(--lime)">${st.mastered}</div><div class="bc-num-lbl">Mastered</div></div>
            <div class="bc-num-item"><div class="bc-num-val" style="color:var(--amber)">${st.revTotal}</div><div class="bc-num-lbl">Revisions</div></div>
          </div>
          <div class="bc-pct" style="color:${col}">${st.pct}%</div>
          <div class="bc-bar"><div class="bcb-m" style="flex:${st.mastered}"></div><div class="bcb-d" style="flex:${st.doing}"></div><div class="bcb-e"></div></div>
          <div class="bc-subjs">
            ${subs.map(s=>{const ss=subStats(s);return`<div class="bc-subj-row" onclick="${isChem(s)?`openSub('${s.id}','Physical Chemistry')`:`openSub('${s.id}',null)`}">
              <div class="bc-subj-dot" style="background:${s.color}"></div>
              <span class="bc-subj-name">${escH(s.name)}</span>
              <span class="bc-subj-pct" style="color:${s.color}">${ss.pct}%</span>
            </div>`}).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="an-section">
    <div class="an-title">Subject-wise Analysis</div>
    <div class="subj-analytics-grid">
      ${db.subjects.map(s => {
        const ss  = subStats(s);
        const col = ss.pct>=70?'var(--lime)':ss.pct>=40?'var(--cyan)':'var(--t2)';
        const target = isChem(s)?`openSub('${s.id}','Physical Chemistry')`:`openSub('${s.id}',null)`;
        return `<div class="sa-card" onclick="${target}">
          <div class="sa-top">
            <div class="sa-icon" style="background:${s.color}18;color:${s.color}">${s.icon||'📘'}</div>
            <div><div class="sa-name">${escH(s.name)}</div><div class="sa-cls">Class ${s.classNum} · ${ss.total} ch</div></div>
          </div>
          <div class="sa-stats">
            <div class="sa-stat"><div class="sa-stat-n" style="color:var(--doing-c)">${ss.doing}</div><div class="sa-stat-l">Doing</div></div>
            <div class="sa-stat"><div class="sa-stat-n" style="color:var(--lime)">${ss.mastered}</div><div class="sa-stat-l">Master</div></div>
            <div class="sa-stat"><div class="sa-stat-n" style="color:var(--amber)">${ss.revTotal}</div><div class="sa-stat-l">Revs</div></div>
          </div>
          <div class="sa-prog-row"><span>Progress</span><span class="sa-prog-pct" style="color:${col}">${ss.pct}%</span></div>
          <div class="sa-bar"><div class="sa-bar-fill" style="width:${ss.pct}%;background:${s.color}"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="an-section">
    <div class="an-title">Chapter Flags</div>
    <div class="flag-lists">
      <div class="flag-card">
        <div class="flag-card-title"><span style="color:var(--rose)">⚠</span> Weak Chapters <span style="font-size:9px;color:var(--t4);font-weight:400">(not started)</span></div>
        ${flagList(weak,'not started','weak')}
      </div>
      <div class="flag-card">
        <div class="flag-card-title"><span style="color:var(--amber)">↺</span> Needs First Revision <span style="font-size:9px;color:var(--t4);font-weight:400">(0 revisions)</span></div>
        ${flagList(needRev,'revise now','rev')}
      </div>
    </div>
  </div>`;

  document.getElementById('page-analytics').innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  const f = document.querySelector('#' + id + ' input, #' + id + ' select');
  if (f) setTimeout(() => f.focus(), 120);
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(el =>
  el.addEventListener('click', e => { if (e.target === el) closeModal(el.id); })
);

function buildColorPicker() {
  const el = document.getElementById('ms_colors'); selColor = PALETTE[0];
  el.innerHTML = PALETTE.map(c =>
    `<div class="col-swatch${c===selColor?' sel':''}" style="background:${c};box-shadow:0 0 8px ${c}66" onclick="pickColor('${c}')"></div>`
  ).join('');
}
function pickColor(c) {
  selColor = c;
  document.querySelectorAll('.col-swatch').forEach(el =>
    el.classList.toggle('sel', el.style.backgroundColor === c || el.style.background === c)
  );
}

function openAddChapterModal() {
  document.getElementById('mc_title').value = '';
  document.getElementById('mc_desc').value  = '';
  openModal('addChapterModal');
}
function saveNewChapter() {
  const t = document.getElementById('mc_title').value.trim(); if (!t) return;
  const desc = document.getElementById('mc_desc').value.trim();
  const s    = getSub(currentSubId);
  const sec  = isChem(s) ? currentChemSection : null;
  s.chapters.push({ id:uid(), title:t, desc, doing:false, mastered:false, revisions:0, items:[], chemSection:sec, open:false });
  save(); closeModal('addChapterModal'); renderSubjectView();
}
function saveNewSubject() {
  const name = document.getElementById('ms_name').value.trim(); if (!name) return;
  const icon = document.getElementById('ms_icon').value.trim() || '📘';
  const s    = { id:uid(), name, icon, color:selColor,
    classNum: parseInt(document.getElementById('ms_class').value),
    type:     document.getElementById('ms_type').value,
    chapters: []
  };
  db.subjects.push(s); save();
  closeModal('addSubjectModal');
  renderSidebar(); renderHome();
  openSub(s.id, isChem(s) ? 'Physical Chemistry' : null);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function setPage(name) {
  document.getElementById('page-home').style.display      = name==='home'      ? 'block' : 'none';
  document.getElementById('page-content').style.display   = name==='content'   ? 'block' : 'none';
  document.getElementById('page-analytics').style.display = name==='analytics' ? 'block' : 'none';
}

function setNavActive(id) {
  ['nav-dash','nav-analytics'].forEach(n => document.getElementById(n).classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}
