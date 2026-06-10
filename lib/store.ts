import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Chapter, SubTopic, Page, ChemSection, User } from './types';
import { buildSeedData } from './seed-data';
import { loadUserData, saveUserData, CloudData, updatePublicProfile, generateFriendCode } from './firestore';
import { auth } from './firebase';

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_ITEM_LABELS = ['Lectures', 'DPPs'];

function makeDefaultItems(): SubTopic[] {
  return DEFAULT_ITEM_LABELS.map(label => ({ id: uid(), label, done: false }));
}

export interface ProgressSnapshot {
  date: string;
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
  syncReady: boolean;
  syncPending: boolean;

  setPage: (p: Page) => void;
  openSubject: (subId: string, chemSection?: ChemSection | null) => void;
  setCurrentClassNum: (classNum: 11 | 12) => void;
  setCurrentChemSection: (sec: ChemSection | null) => void;

  setUser: (u: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  resetAllProgress: () => void;
  resetProgressData: () => void;

  loadFromCloud: (uid: string) => Promise<void>;
  saveToCloud: () => Promise<void>;
  analyticsClassFilter: 'all' | 11 | 12;
  setAnalyticsClassFilter: (f: 'all' | 11 | 12) => void;
  importData: (data: { subjects: Subject[]; progressHistory: ProgressSnapshot[]; user: User }) => Promise<void>;

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

  recordProgressSnapshot: () => void;
}

function toCloudData(state: Store): CloudData {
  return {
    subjects: state.subjects,
    progressHistory: state.progressHistory,
    currentClassNum: state.currentClassNum,
    user: {
      uid: state.user?.uid,
      name: state.user?.name || '',
      email: state.user?.email || '',
      photo: state.user?.photo,
      examName: state.user?.examName,
      examDate: state.user?.examDate,
      targetDate: state.user?.targetDate,
      friendCode: state.user?.friendCode,
    },
    updatedAt: Date.now(),
  };
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
      syncReady: false,
      syncPending: false,

      setPage: (page) => set({ page }),

      openSubject: (currentSubId, currentChemSection = null) =>
        set({ page: 'subject', currentSubId, currentChemSection }),

      setCurrentClassNum: (currentClassNum) => set({ currentClassNum }),

      setCurrentChemSection: (currentChemSection) => set({ currentChemSection }),

      setUser: (user) => set((st) => ({
        user: user ? { ...user, friendCode: st.user?.friendCode || user.friendCode } : null,
        page: user ? 'home' : 'login',
      })),

      updateUser: (patch) => {
        set((st) => ({ user: st.user ? { ...st.user, ...patch } : st.user }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      logout: () => {
        // Sign out of Firebase — clears the persisted Firebase session
        auth.signOut().catch(() => {});
        // Clear local Zustand cache
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nexus-jee-v7');
        }
        set({
          user: null,
          page: 'login',
          subjects: buildSeedData(),
          progressHistory: [],
          currentSubId: null,
          currentChemSection: null,
          currentClassNum: 11,
          syncReady: false,
        });
      },

      loadFromCloud: async (userUid: string) => {
        const cloud = await loadUserData(userUid);
        if (cloud) {
          // Only generate friend code if user genuinely doesn't have one
          const existingCode = cloud.user?.friendCode || get().user?.friendCode;
          const friendCode = existingCode || generateFriendCode();

          // If we just generated a new code, persist it to Firestore immediately
          // so it doesn't change on the next refresh
          if (!existingCode) {
            await saveUserData(userUid, {
              ...cloud,
              user: { ...cloud.user, friendCode },
            });
          }

          set({
            subjects: cloud.subjects,
            progressHistory: cloud.progressHistory || [],
            currentClassNum: cloud.currentClassNum || 11,
            user: {
              ...get().user!,
              name: cloud.user?.name || get().user?.name || '',
              email: cloud.user?.email || get().user?.email || '',
              examName: cloud.user?.examName,
              examDate: cloud.user?.examDate,
              targetDate: cloud.user?.targetDate,
              friendCode,
            },
            syncReady: true,
          });
          // Update public profile — delay to ensure state is settled
          setTimeout(() => {
            const s = get();
            if (s.user?.friendCode) get().saveToCloud();
          }, 500);
        } else {
          const state = get();
          const friendCode = state.user?.friendCode || generateFriendCode();
          const cloudData: CloudData = {
            subjects: state.subjects,
            progressHistory: state.progressHistory,
            currentClassNum: state.currentClassNum,
            user: {
              uid: userUid,
              name: state.user?.name || '',
              email: state.user?.email || '',
              photo: state.user?.photo,
              examName: state.user?.examName,
              examDate: state.user?.examDate,
              targetDate: state.user?.targetDate,
              friendCode,
            },
            updatedAt: Date.now(),
          };
          await saveUserData(userUid, cloudData);
          set({
            syncReady: true,
            user: { ...get().user!, friendCode },
          });
          // Create public profile for new user immediately
          setTimeout(() => get().saveToCloud(), 0);
        }
      },

      saveToCloud: async () => {
        const state = get();
        if (!state.syncReady || !state.user?.uid) return;
        set({ syncPending: true });
        await saveUserData(state.user.uid, toCloudData(state));

        // Also update public profile so friends can see latest progress
        const uid = state.user.uid;
        const subjects = state.subjects;
        const gs = globalStats(subjects);
        const class11 = classStats(subjects, 11);
        const class12 = classStats(subjects, 12);
        const doingChapter = subjects
          .flatMap(s => s.chapters.map(c => ({ ...c, subjectName: s.name })))
          .find(c => c.doing && !c.mastered) ?? null;
        const recentMastered = subjects
          .flatMap(s => s.chapters.filter(c => c.mastered).map(c => c.title))
          .slice(-5).reverse();

        const doingChapters = subjects
          .flatMap(s => s.chapters
            .filter(c => c.doing && !c.mastered)
            .map(c => ({ title: c.title, subjectName: s.name }))
          )
          .slice(0, 5); // cap at 5

        await updatePublicProfile(uid, {
          name: state.user.name,
          friendCode: state.user.friendCode || '',
          examName: state.user.examName,
          examDate: state.user.examDate,
          class11Pct: class11.pct,
          class12Pct: class12.pct,
          overallPct: gs.pct,
          masteredCount: gs.mastered,
          totalChapters: gs.total,
          currentChapter: doingChapter ? { title: doingChapter.title, subjectName: doingChapter.subjectName } : null,
          doingChapters,
          recentMastered,
          updatedAt: Date.now(),
        });

        set({ syncPending: false });
      },

      analyticsClassFilter: 'all' as 'all' | 11 | 12,
      setAnalyticsClassFilter: (f) => set({ analyticsClassFilter: f }),

      importData: async (data) => {
        // If the export is a diff-format (v2), merge onto fresh seed data
        // If it's a full subjects array (v1 legacy), deduplicate chapters by id before setting
        let importedSubjects: Subject[];
        if (data.subjects && Array.isArray(data.subjects)) {
          if ((data as any).version === 2 && (data as any).chapterChanges) {
            // v2 format: merge changes onto fresh seed
            const seed = buildSeedData();
            const changes = (data as any).chapterChanges as Record<string, {
              doing?: boolean; mastered?: boolean; revisions?: number; items?: Record<string, boolean>;
            }>;
            importedSubjects = seed.map(s => ({
              ...s,
              chapters: s.chapters.map(c => {
                const ch = changes[c.id];
                if (!ch) return c;
                return {
                  ...c,
                  doing: ch.doing ?? c.doing,
                  mastered: ch.mastered ?? c.mastered,
                  revisions: ch.revisions ?? c.revisions,
                  items: c.items.map(i => ({
                    ...i,
                    done: ch.items?.[i.id] ?? i.done,
                  })),
                };
              }),
            }));
          } else {
            // v1 legacy: deduplicate chapters by id within each subject
            importedSubjects = data.subjects.map((s: Subject) => ({
              ...s,
              chapters: Array.from(
                new Map(s.chapters.map((c: Chapter) => [c.id, c])).values()
              ),
            }));
          }
        } else {
          importedSubjects = buildSeedData();
        }
        set({ subjects: importedSubjects, progressHistory: data.progressHistory || [], user: data.user });
        setTimeout(() => get().saveToCloud(), 0);
      },

      resetAllProgress: () => {
        set({ subjects: buildSeedData(), progressHistory: [] });
        setTimeout(() => get().saveToCloud(), 0);
      },

      resetProgressData: () => {
        set((st) => ({
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
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      addSubject: (s) => {
        set((st) => ({ subjects: [...st.subjects, { ...s, id: uid(), chapters: [] }] }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      deleteSubject: (id) => {
        set((st) => ({ subjects: st.subjects.filter((s) => s.id !== id), page: 'home', currentSubId: null }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      addChapter: (subId, title, desc, chemSection = null) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: [...s.chapters, { id: uid(), title, desc, doing: false, mastered: false, revisions: 0, items: makeDefaultItems(), chemSection, open: false }],
            }
          ),
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      updateChapter: (subId, chId, patch) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : { ...s, chapters: s.chapters.map((c) => c.id === chId ? { ...c, ...patch } : c) }
          ),
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      deleteChapter: (subId, chId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : { ...s, chapters: s.chapters.filter((c) => c.id !== chId) }
          ),
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      reorderChapters: (subId, fromIdx, toIdx, chemSection = null) => {
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
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      toggleDoing: (subId, chId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, doing: !c.doing, mastered: !c.doing ? false : c.mastered }
              ),
            }
          ),
        }));
        setTimeout(() => { get().recordProgressSnapshot(); get().saveToCloud(); }, 0);
      },

      toggleMastered: (subId, chId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, mastered: !c.mastered, doing: !c.mastered ? false : c.doing }
              ),
            }
          ),
        }));
        setTimeout(() => { get().recordProgressSnapshot(); get().saveToCloud(); }, 0);
      },

      changeRevisions: (subId, chId, delta) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, revisions: Math.max(0, (c.revisions || 0) + delta) }
              ),
            }
          ),
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      addItem: (subId, chId, label) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, items: [...(c.items || []), { id: uid(), label, done: false }] }
              ),
            }
          ),
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      toggleItem: (subId, chId, itemId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, done: !i.done } : i) }
              ),
            }
          ),
        }));
        setTimeout(() => { get().recordProgressSnapshot(); get().saveToCloud(); }, 0);
      },

      deleteItem: (subId, chId, itemId) => {
        set((st) => ({
          subjects: st.subjects.map((s) =>
            s.id !== subId ? s : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId || DEFAULT_ITEM_LABELS.includes(i.label)) }
              ),
            }
          ),
        }));
        setTimeout(() => get().saveToCloud(), 0);
      },

      recordProgressSnapshot: () =>
        set((st) => {
          const today = new Date().toISOString().split('T')[0];
          const gs = globalStats(st.subjects);
          const snapshot: ProgressSnapshot = { date: today, topicsDone: gs.topicsDone, mastered: gs.mastered, doing: gs.doing };
          const existing = st.progressHistory.find((p) => p.date === today);
          if (existing) {
            return { progressHistory: st.progressHistory.map((p) => p.date === today ? snapshot : p) };
          }
          return { progressHistory: [...st.progressHistory, snapshot].slice(-60) };
        }),
    }),
    {
      name: 'nexus-jee-v7',
      skipHydration: true,
      partialize: (state) => ({
        subjects: state.subjects,
        progressHistory: state.progressHistory,
        currentClassNum: state.currentClassNum,
        user: state.user,
      }),
    }
  )
);

export function subjectStats(s: Subject, chemSection?: ChemSection | null) {
  const chs = chemSection ? s.chapters.filter((c) => c.chemSection === chemSection) : s.chapters;
  const revTotal = chs.reduce((acc, c) => acc + (c.revisions || 0), 0);
  const topicsTotal = chs.reduce((acc, c) => acc + c.items.length, 0);
  // Mastered chapter = all its tasks count as done
  const topicsDone = chs.reduce((acc, c) => acc + (c.mastered ? c.items.length : c.items.filter((i) => i.done).length), 0);
  return {
    total: chs.length,
    doing: chs.filter((c) => c.doing).length,
    mastered: chs.filter((c) => c.mastered).length,
    notStarted: chs.filter((c) => !c.doing && !c.mastered).length,
    revTotal, topicsTotal, topicsDone,
    pct: topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0,
  };
}

export function globalStats(subjects: Subject[]) {
  let total = 0, doing = 0, mastered = 0, revTotal = 0, topicsTotal = 0, topicsDone = 0;
  subjects.forEach((s) => {
    const st = subjectStats(s);
    total += st.total; doing += st.doing; mastered += st.mastered;
    revTotal += st.revTotal; topicsTotal += st.topicsTotal; topicsDone += st.topicsDone;
  });
  return { total, doing, mastered, revTotal, topicsTotal, topicsDone, pct: topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0 };
}

export function classStats(subjects: Subject[], classNum: 11 | 12) {
  return globalStats(subjects.filter((s) => s.classNum === classNum));
}
