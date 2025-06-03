
import type * as LucideIconsActual from 'lucide-react'; // Keep for actual icon component type reference if needed elsewhere or for validation

export type NavItem = {
  href: string;
  label: string;
  iconName: string; // Changed from keyof typeof LucideIconTypes to plain string
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
  { href: '/admin/schedules', label: 'Recruitment Schedules', iconName: 'BarChart3' }, // Corrected from CalendarDays to BarChart3 as per existing code for admin
  { href: '/admin/resume-ranking', label: 'Resume Ranking', iconName: 'Search' }, // Corrected from FileSearch to Search
];

export const companyNavItems: NavItem[] = [
  { href: '/company/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', matchExact: true },
  { href: '/company/job-postings', label: 'Job Postings', iconName: 'Send' }, // icon was ListChecks, changed to Send
  { href: '/company/interviews', label: 'Interview Schedules', iconName: 'BookUser' }, // icon was CalendarClock, changed to BookUser
];

export const collegeNavItems: NavItem[] = [
  { href: '/college/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard', matchExact: true },
  { href: '/college/students/all', label: 'Student Details', iconName: 'Users' }, // icon was School, changed to Users
  { href: '/college/statistics', label: 'Recruitment Stats', iconName: 'BarChart3' }, // icon was BarChartBig, changed to BarChart3
];

export const commonNavItems: NavItem[] = [
   { href: '/common/notifications', label: 'Notifications', iconName: 'Bell' }, // icon was FileText, changed to Bell based on UserNav
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
      // When no specific role, or on a page like /login, we might not want commonNavItems to show if it's notifications.
      // Or, provide a truly generic set or an empty array if no nav is needed.
      // For now, returning commonNavItems, but this might need refinement based on UX for unauthenticated/common pages.
      return commonNavItems;
  }
};
