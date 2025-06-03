
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { studentNavItems } from '@/lib/constants';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={studentNavItems} role="Student">{children}</MainLayout>;
}
