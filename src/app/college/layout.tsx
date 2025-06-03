
"use client";
import type React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { collegeNavItems } from '@/lib/constants';
import { withAuth } from '@/components/auth/withAuth';

function CollegeLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={collegeNavItems} role="College">{children}</MainLayout>;
}

export default withAuth(CollegeLayout, ['college']);
