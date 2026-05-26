// src/types/index.ts

export type ChemSection = 'Physical' | 'Organic' | 'Inorganic';

export interface SubTopic {
  id: string;
  label: string;
  done: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  desc?: string;
  doing: boolean;
  mastered: boolean;
  revisions: number;
  items: SubTopic[];
  chemSection?: ChemSection | null;
  open?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  classNum: 11 | 12;
  type: 'normal' | 'chemistry';
  chapters: Chapter[];
}

export type Page = 'login' | 'home' | 'subject' | 'analytics';

export interface AppState {
  page: Page;
  currentSubId: string | null;
  currentChemSection: ChemSection | null;
}
