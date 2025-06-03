
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { commonNavItems, getNavItemsByRole } from '@/lib/constants';
import { headers } from 'next/headers';

// This is a simplified way to determine role for common layout.
// In a real app, auth context would provide this.
// For common layout, it might show a default set of nav items or adapt.
const getRoleFromServer = () => {
  const headerList = headers();
  const pathname = headerList.get('x-next-pathname') || ''; // Next.js might provide this or similar
  if (pathname.startsWith('/student')) return 'student';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/company')) return 'company';
  if (pathname.startsWith('/college')) return 'college';
  return null; // default or common role
}

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  const role = getRoleFromServer();
  const navItems = getNavItemsByRole(role); // This will select role-specific nav if on a role page, or commonNavItems if role is null

  return <MainLayout navItems={navItems} role={role || undefined}>{children}</MainLayout>;
}
