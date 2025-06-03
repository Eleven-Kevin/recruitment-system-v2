
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { collegeNavItems } from '@/lib/constants';

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={collegeNavItems} role="College">{children}</MainLayout>;
}
