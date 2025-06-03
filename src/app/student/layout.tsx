
"use client";
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { studentNavItems } from '@/lib/constants';
import { withAuth } from '@/components/auth/withAuth';

function StudentLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={studentNavItems} role="Student">{children}</MainLayout>;
}

export default withAuth(StudentLayout, ['student']);
