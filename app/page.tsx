'use client';

import { useStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import LoginPage from '@/components/login-page';
import DashboardPage from '@/components/dashboard-page';
import SubjectsPage from '@/components/subjects-page';
import SubjectDetailPage from '@/components/subject-detail-page';
import AnalyticsPage from '@/components/analytics-page';

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
      // Keep mounted until exit transition finishes (matches 200ms CSS transition)
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  if (!mounted) return null;

  return (
    <div
      style={{
        transition: 'opacity 200ms ease, transform 200ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const page = useStore(s => s.page);

  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return (
    <>
      <PageWrapper isActive={page === 'login'}><LoginPage /></PageWrapper>
      <PageWrapper isActive={page === 'home'}><DashboardPage /></PageWrapper>
      <PageWrapper isActive={page === 'subjects'}><SubjectsPage /></PageWrapper>
      <PageWrapper isActive={page === 'subject'}><SubjectDetailPage /></PageWrapper>
      <PageWrapper isActive={page === 'analytics'}><AnalyticsPage /></PageWrapper>
    </>
  );
}
