import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Subject, User } from './types';
import { ProgressSnapshot } from './store';

export interface CloudData {
  subjects: Subject[];
  progressHistory: ProgressSnapshot[];
  currentClassNum: 11 | 12;
  user: {
    uid?: string;
    name: string;
    email: string;
    photo?: string;
    examName?: string;
    examDate?: string;
    targetDate?: string;
  };
  updatedAt: number; // unix ms — used to detect stale writes
}

export async function loadUserData(uid: string): Promise<CloudData | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as CloudData;
  } catch (err) {
    console.error('[Nexus] Firestore load error:', err);
    return null;
  }
}

export async function saveUserData(uid: string, data: CloudData): Promise<void> {
  try {
    // Firestore rejects undefined values — strip them out recursively
    const clean = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, 'users', uid), clean);
  } catch (err) {
    console.error('[Nexus] Firestore save error:', err);
  }
}
