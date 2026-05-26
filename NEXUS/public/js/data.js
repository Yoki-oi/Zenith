// data.js — JEE syllabus seed data + DB access layer

const PALETTE = ['#ff6b35','#00d4ff','#a8ff3e','#ffb547','#d97cff','#ff4d8a','#39e09b','#3cb8ff','#ff9f3c','#c8ff55'];
const CHEM_SECTIONS = ['Physical Chemistry','Organic Chemistry','Inorganic Chemistry'];
const CHEM_SHORT = { 'Physical Chemistry':'PC', 'Organic Chemistry':'OC', 'Inorganic Chemistry':'IOC' };

// ── DB ──────────────────────────────────────────────────────────────────────
let db = JSON.parse(localStorage.getItem('jee_nexus_v2') || 'null');
if (!db || !db.subjects) db = { subjects: [] };

function save() { localStorage.setItem('jee_nexus_v2', JSON.stringify(db)); }
function uid()  { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function getSub(id) { return db.subjects.find(s => s.id === id); }
function escH(s)    { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function isChem(s)  { return s && s.type === 'chemistry'; }

// ── STATS ───────────────────────────────────────────────────────────────────
// Score: doing=1, mastered=2 out of max 2 per chapter
function subStats(s, chemSection = null) {
  const chs = chemSection
    ? s.chapters.filter(c => c.chemSection === chemSection)
    : s.chapters;
  let total = chs.length, doing = 0, mastered = 0, revTotal = 0, scored = 0;
  chs.forEach(ch => {
    if (ch.doing)    { doing++;   scored += 1; }
    if (ch.mastered) { mastered++;  scored += ch.doing ? 1 : 2; } // mastered gives full 2
    // normalize: mastered overrides doing score
    if (ch.mastered) scored -= ch.doing ? 1 : 0; // avoid double count
    revTotal += ch.revisions || 0;
  });
  // Clean re-calc
  scored = 0;
  chs.forEach(ch => {
    if (ch.mastered) scored += 2;
    else if (ch.doing) scored += 1;
  });
  const pct = total ? Math.round(scored / (total * 2) * 100) : 0;
  return { total, doing, mastered, revTotal, scored, pct };
}

function globalStats() {
  let total = 0, doing = 0, mastered = 0, revTotal = 0, scored = 0;
  db.subjects.forEach(s => {
    const st = subStats(s);
    total += st.total; doing += st.doing; mastered += st.mastered;
    revTotal += st.revTotal; scored += st.scored;
  });
  const pct = total ? Math.round(scored / (total * 2) * 100) : 0;
  return { total, doing, mastered, revTotal, scored, pct };
}

function classStats(classNum) {
  let total = 0, doing = 0, mastered = 0, revTotal = 0, scored = 0;
  db.subjects.filter(s => s.classNum === classNum).forEach(s => {
    const st = subStats(s);
    total += st.total; doing += st.doing; mastered += st.mastered;
    revTotal += st.revTotal; scored += st.scored;
  });
  const pct = total ? Math.round(scored / (total * 2) * 100) : 0;
  return { total, doing, mastered, revTotal, scored, pct };
}

// ── SEED ────────────────────────────────────────────────────────────────────
function seed() {
  if (db.subjects.length) return;
  const jee = [
    { name:'Mathematics', icon:'∑', color:'#a8ff3e', classNum:11, type:'normal', chs:[
      'Sets, Relations & Functions','Complex Numbers & Quadratic Equations',
      'Sequences & Series','Permutations & Combinations','Binomial Theorem',
      'Straight Lines & Pair of Lines','Circles','Conic Sections',
      'Limits, Continuity & Differentiability','Differentiation',
      'Trigonometry & Inverse Trigonometric Functions','Mathematical Induction',
      'Statistics & Probability','Matrices & Determinants (intro)','3D Geometry (intro)',
    ]},
    { name:'Physics', icon:'⚡', color:'#00d4ff', classNum:11, type:'normal', chs:[
      'Units, Dimensions & Error Analysis','Kinematics (1D & 2D)',
      "Newton's Laws of Motion",'Work, Energy & Power',
      'Rotational Mechanics & Moment of Inertia','Gravitation',
      'Simple Harmonic Motion','Mechanical Properties of Solids',
      'Fluid Mechanics','Thermal Physics & Calorimetry',
      'Thermodynamics','Kinetic Theory of Gases','Waves & Sound',
    ]},
    { name:'Chemistry', icon:'⚗', color:'#d97cff', classNum:11, type:'chemistry', chemChs:[
      { t:'Mole Concept & Stoichiometry',        s:'Physical Chemistry' },
      { t:'Atomic Structure',                    s:'Physical Chemistry' },
      { t:'Chemical Thermodynamics',             s:'Physical Chemistry' },
      { t:'States of Matter (Gas & Liquid)',     s:'Physical Chemistry' },
      { t:'Chemical Equilibrium',                s:'Physical Chemistry' },
      { t:'Ionic Equilibrium & pH',              s:'Physical Chemistry' },
      { t:'Redox Reactions',                     s:'Physical Chemistry' },
      { t:'IUPAC Nomenclature & Isomerism',      s:'Organic Chemistry' },
      { t:'General Organic Chemistry (GOC)',     s:'Organic Chemistry' },
      { t:'Hydrocarbons (Alkanes, Alkenes, Alkynes, Arenes)', s:'Organic Chemistry' },
      { t:'Periodic Table & Periodicity',        s:'Inorganic Chemistry' },
      { t:'Chemical Bonding & Molecular Structure', s:'Inorganic Chemistry' },
      { t:'s-Block Elements',                    s:'Inorganic Chemistry' },
      { t:'p-Block Elements (Groups 13 & 14)',   s:'Inorganic Chemistry' },
    ]},
    { name:'Mathematics', icon:'∑', color:'#a8ff3e', classNum:12, type:'normal', chs:[
      'Relations & Functions (Advanced)','Inverse Trigonometric Functions',
      'Matrices & Determinants','Continuity & Differentiability',
      'Applications of Derivatives (AOD)','Indefinite Integration',
      'Definite Integration','Area Under Curves',
      'Differential Equations','Vector Algebra',
      '3D Geometry','Linear Programming','Probability',
    ]},
    { name:'Physics', icon:'⚡', color:'#00d4ff', classNum:12, type:'normal', chs:[
      'Electrostatics','Electric Potential & Capacitance',
      'Current Electricity','Moving Charges & Magnetism',
      'Magnetism & Magnetic Materials','Electromagnetic Induction',
      'Alternating Current & Circuits','Electromagnetic Waves',
      'Ray Optics & Optical Instruments','Wave Optics',
      'Dual Nature of Matter & Radiation','Atoms & Nuclei',
      'Semiconductor Devices & Logic Gates',
    ]},
    { name:'Chemistry', icon:'⚗', color:'#d97cff', classNum:12, type:'chemistry', chemChs:[
      { t:'Solutions & Colligative Properties',  s:'Physical Chemistry' },
      { t:'Electrochemistry',                    s:'Physical Chemistry' },
      { t:'Chemical Kinetics',                   s:'Physical Chemistry' },
      { t:'Surface Chemistry',                   s:'Physical Chemistry' },
      { t:'Solid State',                         s:'Physical Chemistry' },
      { t:'Haloalkanes & Haloarenes',            s:'Organic Chemistry' },
      { t:'Alcohols, Phenols & Ethers',          s:'Organic Chemistry' },
      { t:'Aldehydes, Ketones & Carboxylic Acids', s:'Organic Chemistry' },
      { t:'Amines & Diazonium Salts',            s:'Organic Chemistry' },
      { t:'Polymers & Biomolecules',             s:'Organic Chemistry' },
      { t:'d & f Block Elements',                s:'Inorganic Chemistry' },
      { t:'Coordination Compounds',              s:'Inorganic Chemistry' },
      { t:'p-Block Elements (Groups 15–18)',     s:'Inorganic Chemistry' },
      { t:'Metallurgy & General Principles',     s:'Inorganic Chemistry' },
    ]},
  ];

  jee.forEach(def => {
    const s = { id:uid(), name:def.name, icon:def.icon, color:def.color,
      classNum:def.classNum, type:def.type, chapters:[] };
    if (def.chs) {
      def.chs.forEach(t => s.chapters.push({
        id:uid(), title:t, desc:'', doing:false, mastered:false, revisions:0, items:[], chemSection:null, open:false
      }));
    }
    if (def.chemChs) {
      def.chemChs.forEach(c => s.chapters.push({
        id:uid(), title:c.t, desc:'', doing:false, mastered:false, revisions:0, items:[], chemSection:c.s, open:false
      }));
    }
    db.subjects.push(s);
  });
  save();
}
