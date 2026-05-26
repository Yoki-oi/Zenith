// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Chapter, SubTopic, Page, ChemSection } from '../types';
import { buildSeedData } from '../data/seed';

const uid = () => Math.random().toString(36).slice(2, 10);

// Default study tasks added to every new chapter
const DEFAULT_TASKS = ['Lectures', 'DPPs'];

function makeDefaultItems(): SubTopic[] {
  return DEFAULT_TASKS.map(label => ({ id: uid(), label, done: false }));
}

interface Store {
  subjects: Subject[];
  page: Page;
  currentSubId: string | null;
  currentChemSection: ChemSection | null;
  user: { name: string; email: string; photo?: string } | null;

  setPage: (p: Page) => void;
  openSubject: (subId: string, chemSection?: ChemSection | null) => void;
  setUser: (u: Store['user']) => void;
  logout: () => void;

  addSubject: (s: Omit<Subject, 'id' | 'chapters'>) => void;
  deleteSubject: (id: string) => void;

  addChapter: (subId: string, title: string, desc: string, chemSection?: ChemSection | null) => void;
  updateChapter: (subId: string, chId: string, patch: Partial<Chapter>) => void;
  deleteChapter: (subId: string, chId: string) => void;
  reorderChapters: (subId: string, fromIdx: number, toIdx: number, chemSection?: ChemSection | null) => void;

  toggleDoing: (subId: string, chId: string) => void;
  toggleMastered: (subId: string, chId: string) => void;
  changeRevisions: (subId: string, chId: string, delta: number) => void;

  addItem: (subId: string, chId: string, label: string) => void;
  toggleItem: (subId: string, chId: string, itemId: string) => void;
  deleteItem: (subId: string, chId: string, itemId: string) => void;
  copyItemToChapter: (fromSubId: string, fromChId: string, itemId: string, toChId: string) => boolean;
  copyItemToAllChapters: (fromSubId: string, fromChId: string, itemId: string) => number;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      subjects: buildSeedData(),
      page: 'login',
      currentSubId: null,
      currentChemSection: null,
      user: null,

      setPage: (page) => set({ page }),
      openSubject: (currentSubId, currentChemSection = null) =>
        set({ page: 'subject', currentSubId, currentChemSection }),
      setUser: (user) => set({ user, page: 'home' }),
      logout: () => set({ user: null, page: 'login' }),

      addSubject: (s) =>
        set((st) => ({ subjects: [...st.subjects, { ...s, id: uid(), chapters: [] }] })),

      deleteSubject: (id) =>
        set((st) => ({ subjects: st.subjects.filter((s) => s.id !== id), page: 'home', currentSubId: null })),

      // addChapter: always seeds default tasks
      addChapter: (subId, title, desc, chemSection = null) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: [
                ...s.chapters,
                {
                  id: uid(), title, desc,
                  doing: false, mastered: false, revisions: 0,
                  items: makeDefaultItems(),
                  chemSection, open: false,
                },
              ],
            }
          ),
        })),

      updateChapter: (subId, chId, patch) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : { ...s, chapters: s.chapters.map((c) => (c.id === chId ? { ...c, ...patch } : c)) }
          ),
        })),

      deleteChapter: (subId, chId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : { ...s, chapters: s.chapters.filter((c) => c.id !== chId) }
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
            const allChs = chemSection ? [...otherChs, ...reordered] : [...reordered, ...otherChs];
            return { ...s, chapters: allChs };
          }),
        })),

      toggleDoing: (subId, chId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, doing: !c.doing, mastered: c.doing ? c.mastered : false }
              ),
            }
          ),
        })),

      toggleMastered: (subId, chId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, mastered: !c.mastered, doing: c.mastered ? c.doing : false }
              ),
            }
          ),
        })),

      changeRevisions: (subId, chId, delta) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, revisions: Math.max(0, (c.revisions || 0) + delta) }
              ),
            }
          ),
        })),

      addItem: (subId, chId, label) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, items: [...(c.items || []), { id: uid(), label, done: false }] }
              ),
            }
          ),
        })),

      toggleItem: (subId, chId, itemId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : {
                  ...c,
                  items: c.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
                }
              ),
            }
          ),
        })),

      deleteItem: (subId, chId, itemId) =>
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId) }
              ),
            }
          ),
        })),

      copyItemToChapter: (fromSubId, fromChId, itemId, toChId) => {
        const st = get();
        const sub = st.subjects.find((s) => s.id === fromSubId);
        if (!sub) return false;
        const fromCh = sub.chapters.find((c) => c.id === fromChId);
        const item   = fromCh?.items.find((i) => i.id === itemId);
        if (!item) return false;
        const toCh = sub.chapters.find((c) => c.id === toChId);
        if (!toCh) return false;
        if (toCh.items.some((i) => i.label === item.label)) return false;
        set((s2) => ({
          subjects: s2.subjects.map((s) =>
            s.id !== fromSubId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== toChId ? c : { ...c, items: [...c.items, { id: uid(), label: item.label, done: false }] }
              ),
            }
          ),
        }));
        return true;
      },

      copyItemToAllChapters: (fromSubId, fromChId, itemId) => {
        const st = get();
        const sub = st.subjects.find((s) => s.id === fromSubId);
        if (!sub) return 0;
        const fromCh = sub.chapters.find((c) => c.id === fromChId);
        const item   = fromCh?.items.find((i) => i.id === itemId);
        if (!item) return 0;
        const targets = sub.chapters.filter(
          (c) => c.id !== fromChId && !c.items.some((i) => i.label === item.label)
        );
        targets.forEach((c) => get().copyItemToChapter(fromSubId, fromChId, itemId, c.id));
        return targets.length;
      },
    }),
    { name: 'nexus-jee-v4' }
  )
);

// ── Stats helpers ────────────────────────────────────────────────────────────
export function subjectStats(s: Subject, chemSection?: ChemSection | null) {
  const chs = chemSection ? s.chapters.filter((c) => c.chemSection === chemSection) : s.chapters;
  const revTotal = chs.reduce((acc, c) => acc + (c.revisions || 0), 0);
  const scored   = chs.reduce((acc, c) => acc + (c.mastered ? 2 : c.doing ? 1 : 0), 0);
  const total    = chs.length;
  const pct      = total ? Math.round(scored / (total * 2) * 100) : 0;
  return {
    total,
    doing:    chs.filter(c => c.doing).length,
    mastered: chs.filter(c => c.mastered).length,
    revTotal, scored, pct,
  };
}

export function globalStats(subjects: Subject[]) {
  let total = 0, doing = 0, mastered = 0, revTotal = 0, scored = 0;
  subjects.forEach((s) => {
    const st = subjectStats(s);
    total += st.total; doing += st.doing; mastered += st.mastered; revTotal += st.revTotal; scored += st.scored;
  });
  const pct = total ? Math.round(scored / (total * 2) * 100) : 0;
  return { total, doing, mastered, revTotal, scored, pct };
}

export function classStats(subjects: Subject[], classNum: 11 | 12) {
  return globalStats(subjects.filter((s) => s.classNum === classNum));
}
