import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function loadUserData(uid: string) {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

export async function saveUserData(
  uid: string,
  data: {
    subjects: any;
    progressHistory: any;
    currentClassNum: 11 | 12;
  }
) {
  await setDoc(
    doc(db, "users", uid),
    data,
    { merge: true }
  );
}