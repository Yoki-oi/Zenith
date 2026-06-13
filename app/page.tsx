'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import LoginPage from '@/components/login-page';
import DashboardPage from '@/components/dashboard-page';
import SubjectsPage from '@/components/subjects-page';
import SubjectDetailPage from '@/components/subject-detail-page';
import AnalyticsPage from '@/components/analytics-page';
import FriendsPage from '@/components/friends-page';

// ─── Page fade wrapper ────────────────────────────────────────────────────────

function PageWrapper({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setMounted(true);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  if (!mounted) return null;

  return (
    <div style={{ transition: 'opacity 200ms ease', opacity: visible ? 1 : 0 }}>
      {children}
    </div>
  );
}

// ─── Cloud loading screen ─────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0d14]">
      <div className="flex flex-col items-center gap-5">
        <img src="/logo.png" alt="Zenith" className="w-16 h-16 rounded-2xl" />
        <p className="text-white text-xl font-bold tracking-tight">Zenith</p>
        <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { page, setUser, loadFromCloud, logout } = useStore();
  const [cloudLoading, setCloudLoading] = useState(true);

  useEffect(() => {
    // Rehydrate Zustand persist cache first
    useStore.persist.rehydrate();

    // Listen for Firebase auth state
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set user immediately so name/email are available
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          photo: firebaseUser.photoURL || undefined,
        });

        // Load cloud data — source of truth
        await loadFromCloud(firebaseUser.uid);

        // Explicitly navigate to home after cloud load
        // (loadFromCloud may not set page, and setUser may have been overridden)
        useStore.getState().setPage('home');
      } else {
        useStore.setState({
          user: null,
          page: 'login',
          syncReady: false,
        });
      }

      setCloudLoading(false);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading screen while Firebase auth resolves + cloud data loads
  if (cloudLoading) return <LoadingScreen />;

  return (
    <>
      <PageWrapper isActive={page === 'login'}><LoginPage /></PageWrapper>
      <PageWrapper isActive={page === 'home'}><DashboardPage /></PageWrapper>
      <PageWrapper isActive={page === 'subjects'}><SubjectsPage /></PageWrapper>
      <PageWrapper isActive={page === 'subject'}><SubjectDetailPage /></PageWrapper>
      <PageWrapper isActive={page === 'analytics'}><AnalyticsPage /></PageWrapper>
      <PageWrapper isActive={page === 'friends'}><FriendsPage /></PageWrapper>
    </>
  );
}
