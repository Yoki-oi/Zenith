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

export type Page = 'login' | 'home' | 'subjects' | 'subject' | 'analytics' | 'friends';

export interface User {
  uid?: string;
  name: string;
  email: string;
  photo?: string;
  examName?: string;
  examDate?: string;
  targetDate?: string;
  friendCode?: string;
}