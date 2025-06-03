import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { companyNavItems } from '@/lib/constants';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={companyNavItems} role="Company">{children}</MainLayout>;
}
