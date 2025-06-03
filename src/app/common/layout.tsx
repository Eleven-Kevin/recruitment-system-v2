
"use client";
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { commonNavItems, getNavItemsByRole } from '@/lib/constants';
import { withAuth } from '@/components/auth/withAuth';
import { usePathname } from 'next/navigation'; // For client-side role detection

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  let role: string | null = null;
  if (pathname.startsWith('/student')) role = 'student';
  else if (pathname.startsWith('/admin')) role = 'admin';
  else if (pathname.startsWith('/company')) role = 'company';
  else if (pathname.startsWith('/college')) role = 'college';
  
  // If we are directly on a common page like /common/notifications,
  // role might be derived from localStorage if needed by MainLayout,
  // but getNavItemsByRole will use the 'null' case for commonNavItems.
  const actualRoleForNav = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const navItems = getNavItemsByRole(actualRoleForNav);

  return <MainLayout navItems={navItems} role={actualRoleForNav || undefined}>{children}</MainLayout>;
}

// Protect common routes, allowing any authenticated user.
export default withAuth(CommonLayout, ['admin', 'student', 'company', 'college']);
