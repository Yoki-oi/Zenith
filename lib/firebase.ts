import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAL7hmbryKeJSIUMa1S0v1iVIkhfaG77u8",
  authDomain: "nexus-jee-6a2a8.firebaseapp.com",
  projectId: "nexus-jee-6a2a8",
  storageBucket: "nexus-jee-6a2a8.firebasestorage.app",
  messagingSenderId: "491499862796",
  appId: "1:491499862796:web:e90f57f0b02a63ceafe729",
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);