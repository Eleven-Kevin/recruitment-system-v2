
import type * as LucideIconTypes from 'lucide-react'; // For type-checking icon names

export type NavItem = {
  href: string;
  label: string;
  iconName: keyof typeof LucideIconTypes; // Changed from 'icon: LucideIcon'
  matchExact?: boolean;
  subItems?: NavItem[];
};

export const studentNavItems: NavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', matchExact: true },
  { href: '/student/profile', label: 'My Profile', iconName: 'User' },
  { href: '/student/job-recommendations', label: 'Job Recommendations', iconName: 'Brain' },
  { href: '/student/applications', label: 'My Applications', iconName: 'FileText' },
];

export const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', matchExact: true },
  { href: '/admin/students', label: 'Manage Students', iconName: 'Users' },
  { href: '/admin/companies', label: 'Manage Companies', iconName: 'Building' },
  { href: '/admin/jobs', label: 'Manage Jobs', iconName: 'Briefcase' },
  { href: '/admin/schedules', label: 'Recruitment Schedules', iconName: 'BarChart3' },
  { href: '/admin/resume-ranking', label: 'Resume Ranking', iconName: 'Search' },
];

export const companyNavItems: NavItem[] = [
  { href: '/company/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', matchExact: true },
  { href: '/company/job-postings', label: 'Job Postings', iconName: 'Send' },
  { href: '/company/interviews', label: 'Interview Schedules', iconName: 'BookUser' },
];

export const collegeNavItems: NavItem[] = [
  { href: '/college/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', matchExact: true },
  { href: '/college/students/all', label: 'Student Details', iconName: 'Users' },
  { href: '/college/statistics', label: 'Recruitment Stats', iconName: 'BarChart3' },
];

export const commonNavItems: NavItem[] = [
   { href: '/common/notifications', label: 'Notifications', iconName: 'FileText' },
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
    default:
      return commonNavItems;
  }
};
