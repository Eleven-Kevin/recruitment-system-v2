import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, Building, Briefcase, FileText, BarChart3, BookUser, Brain, Search, Send } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchExact?: boolean;
  subItems?: NavItem[];
};

export const studentNavItems: NavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/student/profile', label: 'My Profile', icon: User },
  { href: '/student/job-recommendations', label: 'Job Recommendations', icon: Brain },
  { href: '/student/applications', label: 'My Applications', icon: FileText },
];

export const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/admin/students', label: 'Manage Students', icon: Users },
  { href: '/admin/companies', label: 'Manage Companies', icon: Building },
  { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
  { href: '/admin/schedules', label: 'Recruitment Schedules', icon: BarChart3 },
  { href: '/admin/resume-ranking', label: 'Resume Ranking', icon: Search },
];

export const companyNavItems: NavItem[] = [
  { href: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/company/job-postings', label: 'Job Postings', icon: Send },
  // Applicants will be nested or accessed from job postings list
  { href: '/company/interviews', label: 'Interview Schedules', icon: BookUser },
];

export const collegeNavItems: NavItem[] = [
  { href: '/college/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/college/students/all', label: 'Student Details', icon: Users }, // Default to 'all' branch or make dynamic
  { href: '/college/statistics', label: 'Recruitment Stats', icon: BarChart3 },
];

export const commonNavItems: NavItem[] = [
   { href: '/common/notifications', label: 'Notifications', icon: FileText },
];

export const getNavItemsByRole = (role: string | null): NavItem[] => {
  switch (role) {
    case 'student':
      return studentNavItems;
    case 'admin':
      return adminNavItems;
    case 'company':
      return companyNavItems;
    case 'college':
      return collegeNavItems;
    default: // For common pages like notifications, if accessed through a shared layout
      return commonNavItems; 
  }
};
