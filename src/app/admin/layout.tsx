
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { adminNavItems } from '@/lib/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={adminNavItems} role="Admin">{children}</MainLayout>;
}
