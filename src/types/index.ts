export interface Student {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills?: string[];
  preferences?: string;
  resumeUrl?: string; // Link to resume file
  profilePictureUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName?: string; // Denormalized for display
  description: string;
  requiredSkills?: string[];
  requiredGpa?: number;
  location?: string;
  postedDate: string; // ISO date string
  status: 'open' | 'closed';
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  studentName?: string; // Denormalized
  jobTitle?: string; // Denormalized
  companyName?: string; // Denormalized
  status: 'applied' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  appliedDate: string; // ISO date string
  notes?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  companyId: string;
  studentId: string;
  scheduledTime: string; // ISO date string
  location?: string; // or "Online"
  notes?: string;
  feedback?: string; // from company
}

export interface Notification {
  id: string;
  userId: string; // Can be student, company rep, etc.
  message: string;
  type: 'application_status' | 'interview_schedule' | 'company_update' | 'new_job' | 'general';
  isRead: boolean;
  createdAt: string; // ISO date string
  link?: string; // Optional link to relevant page
}

// For AI flows
export type RankedResume = {
  resume: string; // Content of the resume or identifier
  rank: number;
  reason: string;
};

export type RecommendedJob = {
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  relevanceScore: number;
  description?: string;
};
