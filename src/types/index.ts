
export interface Student {
  id: number;
  name: string;
  email: string;
  password?: string; 
  role?: 'student' | 'admin' | 'company' | 'college';
  studentId?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills?: string[]; 
  preferences?: string;
  resumeUrl?: string;
  profilePictureUrl?: string;
  companyId?: number; // Foreign key to companies table for users with 'company' role
  // For AI flow input, might need to enrich with actual applications
  pastApplications?: Application[]; // Or just an array of job IDs: string[]
}

export interface Company {
  id: number; 
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  representativeUser?: { // For returning credentials to admin
    email: string;
    password?: string; // Plain password for display, PROTOTYPE ONLY
  }
}

export interface Job {
  id: number; 
  title: string;
  companyId: number; 
  companyName?: string; 
  description: string;
  requiredSkills?: string[]; 
  requiredGpa?: number;
  location?: string;
  postedDate: string; 
  status: 'open' | 'closed';
}

export interface Application {
  id: number; 
  studentId: number; 
  jobId: number; 
  studentName?: string; // Denormalized
  jobTitle?: string; // Denormalized
  companyName?: string; // Denormalized
  status: 'applied' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'placed'; // Added 'placed'
  appliedDate: string; 
  notes?: string;
}

export interface Schedule {
  id: number;
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string;
  location?: string;
  jobId?: number; // Optional: link to a specific job
  companyId?: number; // Optional: link to a company (could be derived from job if jobId is present)
  jobTitle?: string; // Denormalized for display
  companyName?: string; // Denormalized for display
}


export interface Interview {
  id: number; 
  applicationId: number;
  companyId: number;
  studentId: number;
  scheduledTime: string; 
  location?: string;
  notes?: string;
  feedback?: string;
}

export interface Notification {
  id: string; 
  userId: string;
  message: string;
  type: 'application_status' | 'interview_schedule' | 'company_update' | 'new_job' | 'general';
  isRead: boolean;
  createdAt: string; 
  link?: string;
}

// For AI flows
export type RankedResume = {
  resume: string;
  rank: number;
  reason: string;
};

export type RecommendedJob = {
  jobId: number; 
  jobTitle?: string;
  companyName?: string;
  relevanceScore: number;
  description?: string;
  // Add other job fields needed for display if not fetching full Job object separately
  location?: string;
  requiredSkills?: string[];
  requiredGpa?: number;
  status?: 'open' | 'closed';
  postedDate?: string;
};
