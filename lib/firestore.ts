import {
  doc, getDoc, setDoc, collection, query, where,
  getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, onSnapshot
} from 'firebase/firestore';
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
    friendCode?: string;
  };
  updatedAt: number;
}

// ── User data ─────────────────────────────────────────────────────────────────

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
    const clean = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, 'users', uid), clean);
  } catch (err) {
    console.error('[Nexus] Firestore save error:', err);
  }
}

// ── Public profiles ───────────────────────────────────────────────────────────

export interface PublicProfile {
  uid: string;
  name: string;
  friendCode: string;
  examName?: string;
  examDate?: string;
  class11Pct: number;
  class12Pct: number;
  overallPct: number;
  masteredCount: number;
  totalChapters: number;
  currentChapter: { title: string; subjectName: string } | null;
  doingChapters: { title: string; subjectName: string }[];
  recentMastered: string[]; // last 5 chapter titles
  updatedAt: number;
}

export async function updatePublicProfile(uid: string, profile: Omit<PublicProfile, 'uid'>): Promise<void> {
  try {
    const clean = JSON.parse(JSON.stringify({ uid, ...profile }));
    await setDoc(doc(db, 'publicProfiles', uid), clean);
  } catch (err) {
    console.error('[Nexus] Public profile update error:', err);
  }
}

export async function getPublicProfileByCode(code: string): Promise<PublicProfile | null> {
  try {
    const q = query(collection(db, 'publicProfiles'), where('friendCode', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as PublicProfile;
  } catch (err) {
    console.error('[Nexus] Profile lookup error:', err);
    return null;
  }
}

export async function getPublicProfileByUid(uid: string): Promise<PublicProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'publicProfiles', uid));
    if (!snap.exists()) return null;
    return snap.data() as PublicProfile;
  } catch (err) {
    return null;
  }
}

export async function isFriendCodeTaken(code: string, currentUid: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'publicProfiles'), where('friendCode', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    // Taken if it belongs to someone else
    return snap.docs[0].data().uid !== currentUid;
  } catch {
    return false;
  }
}

// ── Friend requests ───────────────────────────────────────────────────────────

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromName: string;
  fromCode: string;
  toUid: string;
  toName: string;
  toCode: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export async function sendFriendRequest(
  fromUid: string, fromName: string, fromCode: string,
  toUid: string, toName: string, toCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check not already friends or pending
    const existing = await getDocs(query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', fromUid),
      where('toUid', '==', toUid),
    ));
    const reverse = await getDocs(query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', toUid),
      where('toUid', '==', fromUid),
    ));
    if (!existing.empty || !reverse.empty) {
      const doc = (!existing.empty ? existing : reverse).docs[0].data();
      if (doc.status === 'accepted') return { success: false, error: 'Already friends' };
      if (doc.status === 'pending') return { success: false, error: 'Request already sent' };
    }
    await addDoc(collection(db, 'friendRequests'), {
      fromUid, fromName, fromCode,
      toUid, toName, toCode,
      status: 'pending',
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    console.error('[Nexus] Friend request error:', err);
    return { success: false, error: 'Something went wrong' };
  }
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' });
  } catch (err) {
    console.error('[Nexus] Accept request error:', err);
  }
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' });
  } catch (err) {
    console.error('[Nexus] Reject request error:', err);
  }
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  } catch (err) {
    console.error('[Nexus] Cancel request error:', err);
  }
}

export async function removeFriend(myUid: string, friendUid: string): Promise<void> {
  try {
    // Find and delete the accepted request in either direction
    const q1 = await getDocs(query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', myUid),
      where('toUid', '==', friendUid),
      where('status', '==', 'accepted'),
    ));
    const q2 = await getDocs(query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', friendUid),
      where('toUid', '==', myUid),
      where('status', '==', 'accepted'),
    ));
    for (const d of [...q1.docs, ...q2.docs]) await deleteDoc(d.ref);
  } catch (err) {
    console.error('[Nexus] Remove friend error:', err);
  }
}

export async function getPendingRequests(uid: string): Promise<{
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}> {
  try {
    const [inSnap, outSnap] = await Promise.all([
      getDocs(query(collection(db, 'friendRequests'), where('toUid', '==', uid), where('status', '==', 'pending'))),
      getDocs(query(collection(db, 'friendRequests'), where('fromUid', '==', uid), where('status', '==', 'pending'))),
    ]);
    return {
      incoming: inSnap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)),
      outgoing: outSnap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)),
    };
  } catch (err) {
    console.error('[Nexus] Get pending requests error:', err);
    return { incoming: [], outgoing: [] };
  }
}

export async function getFriends(uid: string): Promise<PublicProfile[]> {
  try {
    const [q1, q2] = await Promise.all([
      getDocs(query(collection(db, 'friendRequests'), where('fromUid', '==', uid), where('status', '==', 'accepted'))),
      getDocs(query(collection(db, 'friendRequests'), where('toUid', '==', uid), where('status', '==', 'accepted'))),
    ]);
    const friendUids = [
      ...q1.docs.map(d => d.data().toUid as string),
      ...q2.docs.map(d => d.data().fromUid as string),
    ];
    if (friendUids.length === 0) return [];
    const profiles = await Promise.all(friendUids.map(fid => getPublicProfileByUid(fid)));
    return profiles.filter(Boolean) as PublicProfile[];
  } catch (err) {
    console.error('[Nexus] Get friends error:', err);
    return [];
  }
}

export function subscribeToRequests(
  uid: string,
  callback: (requests: { incoming: FriendRequest[]; outgoing: FriendRequest[] }) => void
): () => void {
  let incoming: FriendRequest[] = [];
  let outgoing: FriendRequest[] = [];
  const notify = () => callback({ incoming, outgoing });

  const unsubIn = onSnapshot(
    query(collection(db, 'friendRequests'), where('toUid', '==', uid), where('status', '==', 'pending')),
    (snap) => {
      incoming = snap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
      notify();
    }
  );

  const unsubOut = onSnapshot(
    query(collection(db, 'friendRequests'), where('fromUid', '==', uid), where('status', '==', 'pending')),
    (snap) => {
      outgoing = snap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
      notify();
    }
  );

  return () => { unsubIn(); unsubOut(); };
}

export function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

