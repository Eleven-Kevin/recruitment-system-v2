
"use client";
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { companyNavItems } from '@/lib/constants';
import { withAuth } from '@/components/auth/withAuth';

function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={companyNavItems} role="Company">{children}</MainLayout>;
}

export default withAuth(CompanyLayout, ['company']);
