
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Chapter, SubTopic, Page, ChemSection, User } from './types';
import { buildSeedData } from './seed-data';

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_ITEM_LABELS = ['Lectures', 'DPPs'];

function makeDefaultItems(): SubTopic[] {
  return DEFAULT_ITEM_LABELS.map(label => ({ id: uid(), label, done: false }));
}

export interface ProgressSnapshot {
  date: string; // YYYY-MM-DD
  topicsDone: number;
  mastered: number;
  doing: number;
}

interface Store {
  subjects: Subject[];
  page: Page;
  currentSubId: string | null;
  currentChemSection: ChemSection | null;
  currentClassNum: 11 | 12;
  user: User | null;
  progressHistory: ProgressSnapshot[];
  // Navigation
  setPage: (p: Page) => void;
  openSubject: (subId: string, chemSection?: ChemSection | null) => void;
  setCurrentClassNum: (classNum: 11 | 12) => void;
  setCurrentChemSection: (sec: ChemSection | null) => void;

  // Auth
  setUser: (u: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  resetAllProgress: () => void;
  resetProgressData: () => void;

  // Subjects
  addSubject: (s: Omit<Subject, 'id' | 'chapters'>) => void;
  deleteSubject: (id: string) => void;

  // Chapters
  addChapter: (subId: string, title: string, desc: string, chemSection?: ChemSection | null) => void;
  updateChapter: (subId: string, chId: string, patch: Partial<Chapter>) => void;
  deleteChapter: (subId: string, chId: string) => void;
  reorderChapters: (subId: string, fromIdx: number, toIdx: number, chemSection?: ChemSection | null) => void;

  // Chapter status
  toggleDoing: (subId: string, chId: string) => void;
  toggleMastered: (subId: string, chId: string) => void;
  changeRevisions: (subId: string, chId: string, delta: number) => void;

  // Tasks
  addItem: (subId: string, chId: string, label: string) => void;
  toggleItem: (subId: string, chId: string, itemId: string) => void;
  deleteItem: (subId: string, chId: string, itemId: string) => void;

  // Analytics
  recordProgressSnapshot: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      subjects: buildSeedData(),
      page: 'login',
      currentSubId: null,
      currentChemSection: null,
      currentClassNum: 11,
      user: null,
      progressHistory: [],

      setPage: (page) => set({ page }),

      openSubject: (currentSubId, currentChemSection = null) =>
        set({ page: 'subject', currentSubId, currentChemSection }),

      setCurrentClassNum: (currentClassNum) => set({ currentClassNum }),

      setCurrentChemSection: (currentChemSection) => set({ currentChemSection }),

      setUser: (user) => set({ user, page: user ? 'home' : 'login' }),
      updateUser: (patch) => set((st) => ({ user: st.user ? { ...st.user, ...patch } : st.user })),

      logout: () => set({ user: null, page: 'login' }),

      // Full reset: wipe everything back to default seed chapters + clear history
      resetAllProgress: () => set({
        subjects: buildSeedData(),
        progressHistory: [],
      }),

      // Soft reset: keep chapters & custom tasks, only clear done/doing/mastered/revisions + history
      resetProgressData: () => set((st) => ({
        progressHistory: [],
        subjects: st.subjects.map(subj => ({
          ...subj,
          chapters: subj.chapters.map(ch => ({
            ...ch,
            doing: false,
            mastered: false,
            revisions: 0,
            items: ch.items.map(i => ({ ...i, done: false })),
          })),
        })),
      })),

      addSubject: (s) =>
        set((st) => ({
          subjects: [...st.subjects, { ...s, id: uid(), chapters: [] }],
        })),

      deleteSubject: (id) =>
        set((st) => ({
          subjects: st.subjects.filter((s) => s.id !== id),
          page: 'home',
          currentSubId: null,
        })),

      addChapter: (subId, title, desc, chemSection = null) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: [
                    ...s.chapters,
                    {
                      id: uid(),
                      title,
                      desc,
                      doing: false,
                      mastered: false,
                      revisions: 0,
                      items: makeDefaultItems(),
                      chemSection,
                      open: false,
                    },
                  ],
                }
          ),
        })),

      updateChapter: (subId, chId, patch) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id === chId ? { ...c, ...patch } : c
                  ),
                }
          ),
        })),

      deleteChapter: (subId, chId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : { ...s, chapters: s.chapters.filter((c) => c.id !== chId) }
          ),
        })),

      reorderChapters: (subId, fromIdx, toIdx, chemSection = null) =>
        set((st) => ({
          subjects: st.subjects.map((s) => {
            if (s.id !== subId) return s;
            const sectionChs = chemSection
              ? s.chapters.filter((c) => c.chemSection === chemSection)
              : s.chapters.filter((c) => !c.chemSection);
            const otherChs = chemSection
              ? s.chapters.filter((c) => c.chemSection !== chemSection)
              : s.chapters.filter((c) => c.chemSection);
            const reordered = [...sectionChs];
            const [moved] = reordered.splice(fromIdx, 1);
            reordered.splice(toIdx, 0, moved);
            return { ...s, chapters: chemSection ? [...otherChs, ...reordered] : [...reordered, ...otherChs] };
          }),
        })),

      toggleDoing: (subId, chId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id !== chId
                      ? c
                      : {
                          ...c,
                          doing: !c.doing,
                          mastered: !c.doing ? false : c.mastered,
                        }
                  ),
                }
          ),
        }));
        setTimeout(() => get().recordProgressSnapshot(), 0);
      },

      toggleMastered: (subId, chId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id !== chId
                      ? c
                      : {
                          ...c,
                          mastered: !c.mastered,
                          doing: !c.mastered ? false : c.doing,
                        }
                  ),
                }
          ),
        }));
        setTimeout(() => get().recordProgressSnapshot(), 0);
      },

      changeRevisions: (subId, chId, delta) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id !== chId
                      ? c
                      : { ...c, revisions: Math.max(0, (c.revisions || 0) + delta) }
                  ),
                }
          ),
        })),

      addItem: (subId, chId, label) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id !== chId
                      ? c
                      : {
                          ...c,
                          items: [...(c.items || []), { id: uid(), label, done: false }],
                        }
                  ),
                }
          ),
        })),

      toggleItem: (subId, chId, itemId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id !== chId
                      ? c
                      : {
                          ...c,
                          items: c.items.map((i) =>
                            i.id === itemId ? { ...i, done: !i.done } : i
                          ),
                        }
                  ),
                }
          ),
        })),

      deleteItem: (subId, chId, itemId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId
              ? s
              : {
                  ...s,
                  chapters: s.chapters.map((c) =>
                    c.id !== chId
                      ? c
                      : { ...c, items: c.items.filter((i) => i.id !== itemId || DEFAULT_ITEM_LABELS.includes(i.label)) }
                  ),
                }
          ),
        })),

      recordProgressSnapshot: () =>
        set((st) => {
          const today = new Date().toISOString().split('T')[0];
          const gs = globalStats(st.subjects);
          const snapshot: ProgressSnapshot = {
            date: today,
            topicsDone: gs.topicsDone,
            mastered: gs.mastered,
            doing: gs.doing,
          };
          const existing = st.progressHistory.find((p) => p.date === today);
          if (existing) {
            return {
              progressHistory: st.progressHistory.map((p) =>
                p.date === today ? snapshot : p
              ),
            };
          }
          return {
            progressHistory: [...st.progressHistory, snapshot].slice(-60),
          };
        }),
    }),
    { name: 'nexus-jee-v7', skipHydration: true }
  )
);

// ─── Stats helpers (used across pages) ───────────────────────────────────────

export function subjectStats(s: Subject, chemSection?: ChemSection | null) {
  const chs = chemSection
    ? s.chapters.filter((c) => c.chemSection === chemSection)
    : s.chapters;
  const revTotal = chs.reduce((acc, c) => acc + (c.revisions || 0), 0);
  const topicsTotal = chs.reduce((acc, c) => acc + c.items.length, 0);
  const topicsDone = chs.reduce(
    (acc, c) => acc + c.items.filter((i) => i.done).length,
    0
  );
  return {
    total: chs.length,
    doing: chs.filter((c) => c.doing).length,
    mastered: chs.filter((c) => c.mastered).length,
    notStarted: chs.filter((c) => !c.doing && !c.mastered).length,
    revTotal,
    topicsTotal,
    topicsDone,
    pct: topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0,
  };
}

export function globalStats(subjects: Subject[]) {
  let total = 0,
    doing = 0,
    mastered = 0,
    revTotal = 0,
    topicsTotal = 0,
    topicsDone = 0;
  subjects.forEach((s) => {
    const st = subjectStats(s);
    total += st.total;
    doing += st.doing;
    mastered += st.mastered;
    revTotal += st.revTotal;
    topicsTotal += st.topicsTotal;
    topicsDone += st.topicsDone;
  });
  const pct = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;
  return { total, doing, mastered, revTotal, topicsTotal, topicsDone, pct };
}

export function classStats(subjects: Subject[], classNum: 11 | 12) {
  return globalStats(subjects.filter((s) => s.classNum === classNum));
}
