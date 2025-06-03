import { PageHeader } from "@/components/core/page-header";
import { ApplicantCard } from "@/components/company/applicant-card";
import type { Student, Application, Job } from "@/types";
import { FileSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mock data - in a real app, this would be fetched based on params.jobId
const mockJob: Job = {
  id: "job-c1-001",
  title: "Graduate Software Engineer",
  companyId: "comp-active",
  companyName: "Active Company LLC",
  description: "Join our dynamic team...",
  status: "open",
  postedDate: "2024-01-01"
};

const mockApplicants: Array<{ student: Student, application: Application }> = [
  {
    student: {
      id: "s1", name: "Alice Wonderland", email: "alice@example.com", major: "Computer Science", gpa: 3.9,
      skills: ["Java", "Spring Boot", "Microservices", "SQL", "Agile"],
      profilePictureUrl: "https://placehold.co/100x100.png?text=AW",
      resumeUrl: "https://example.com/resume_alice.pdf",
    },
    application: { id: "app1s1", studentId: "s1", jobId: "job-c1-001", status: "shortlisted", appliedDate: "2024-01-10" }
  },
  {
    student: {
      id: "s2", name: "Bob The Builder", email: "bob@example.com", major: "Software Engineering", gpa: 3.5,
      skills: ["Python", "Django", "JavaScript", "React", "DevOps"],
      profilePictureUrl: "https://placehold.co/100x100.png?text=BB",
      resumeUrl: "https://example.com/resume_bob.pdf",
    },
    application: { id: "app1s2", studentId: "s2", jobId: "job-c1-001", status: "applied", appliedDate: "2024-01-12" }
  },
  {
    student: {
      id: "s3", name: "Charlie Brown", email: "charlie@example.com", major: "Information Technology", gpa: 3.2,
      skills: ["Networking", "Cybersecurity", "Linux", "Cloud Computing"],
      // profilePictureUrl: "https://placehold.co/100x100.png?text=CB", // Test fallback
    },
    application: { id: "app1s3", studentId: "s3", jobId: "job-c1-001", status: "applied", appliedDate: "2024-01-11" }
  },
];

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  // Use params.jobId to fetch specific job and its applicants
  const jobTitle = mockJob.title; // Fetched job title

  return (
    <>
      <PageHeader
        title={`Applicants for: ${jobTitle}`}
        description={`Review student profiles who applied for Job ID: ${params.jobId}.`}
      />
      {mockApplicants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {mockApplicants.map(({ student, application }) => (
            <ApplicantCard key={student.id} student={student} application={application} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Applicants Yet</h3>
            <p className="text-muted-foreground">
              There are currently no applicants for this job posting.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
