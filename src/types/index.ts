
export interface Student {
  id: number; // Changed to number for DB primary key
  name: string;
  email: string;
  password?: string; // For creation, SHOULD BE HASHED
  role?: 'student' | 'admin' | 'company' | 'college'; // User role
  studentId?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills?: string[]; // Stored as JSON string in DB, parsed in/out
  preferences?: string;
  resumeUrl?: string;
  profilePictureUrl?: string;
}

export interface Company {
  id: number; // Changed to number for DB primary key
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

export interface Job {
  id: number; // Changed to number for DB primary key
  title: string;
  companyId: number; // Foreign key to Company
  companyName?: string; // Denormalized for display, usually via JOIN
  description: string;
  requiredSkills?: string[]; // Stored as JSON string in DB
  requiredGpa?: number;
  location?: string;
  postedDate: string; // ISO date string
  status: 'open' | 'closed';
}

export interface Application {
  id: number; // Changed to number for DB primary key
  studentId: number; // Foreign key to Student
  jobId: number; // Foreign key to Job
  studentName?: string;
  jobTitle?: string;
  companyName?: string;
  status: 'applied' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  appliedDate: string; // ISO date string
  notes?: string;
}

export interface Interview {
  id: number; // Changed to number for DB primary key
  applicationId: number;
  companyId: number;
  studentId: number;
  scheduledTime: string; // ISO date string
  location?: string;
  notes?: string;
  feedback?: string;
}

export interface Notification {
  id: string; // Keeping string if not directly from these DB tables or has external source
  userId: string;
  message: string;
  type: 'application_status' | 'interview_schedule' | 'company_update' | 'new_job' | 'general';
  isRead: boolean;
  createdAt: string; // ISO date string
  link?: string;
}

// For AI flows
export type RankedResume = {
  resume: string;
  rank: number;
  reason: string;
};

export type RecommendedJob = {
  jobId: number; // Changed to number
  jobTitle?: string;
  companyName?: string;
  relevanceScore: number;
  description?: string;
};
