
"use client";
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { adminNavItems } from '@/lib/constants';
import { withAuth } from '@/components/auth/withAuth';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={adminNavItems} role="Admin">{children}</MainLayout>;
}

export default withAuth(AdminLayout, ['admin']);
