import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Eye } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for job postings
const mockCompanyJobs: Job[] = [
  {
    id: "job-c1-001",
    title: "Graduate Software Engineer",
    companyId: "comp-active",
    companyName: "Active Company LLC", // Assuming this is the current company
    description: "Join our dynamic team to build cutting-edge software solutions. Ideal for recent graduates.",
    requiredSkills: ["Java", "Spring Boot", "SQL"],
    requiredGpa: 3.2,
    location: "San Francisco, CA",
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: "open",
  },
  {
    id: "job-c1-002",
    title: "Marketing Intern (Summer)",
    companyId: "comp-active",
    companyName: "Active Company LLC",
    description: "Exciting summer internship opportunity in our marketing department. Gain hands-on experience.",
    requiredSkills: ["Social Media Marketing", "Content Creation", "SEO Basics"],
    requiredGpa: 3.0,
    location: "Remote",
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "open",
  },
  {
    id: "job-c1-003",
    title: "Product Management Trainee",
    companyId: "comp-active",
    companyName: "Active Company LLC",
    description: "A rotational program designed to develop future product leaders.",
    requiredSkills: ["Agile", "Market Research", "Communication"],
    requiredGpa: 3.5,
    location: "New York, NY",
    postedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    status: "closed",
  },
];

export default function CompanyJobPostingsPage() {
  return (
    <>
      <PageHeader
        title="Manage Job Postings"
        description="View, edit, or create new job postings for your company."
        actions={
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/company/job-postings/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Job
            </Link>
          </Button>
        }
      />
      {mockCompanyJobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCompanyJobs.map((job) => (
            <Card key={job.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-headline">{job.title}</CardTitle>
                  <Badge variant={job.status === 'open' ? 'secondary' : 'outline'} className="capitalize">
                    {job.status}
                  </Badge>
                </div>
                <CardDescription>
                  {job.location} &bull; Posted: {new Date(job.postedDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                  {job.description}
                </p>
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mb-1">
                    <span className="text-xs font-semibold">Skills: </span>
                    <span className="text-xs text-muted-foreground">{job.requiredSkills.join(', ')}</span>
                  </div>
                )}
                {job.requiredGpa && (
                  <div>
                    <span className="text-xs font-semibold">Min GPA: </span>
                    <span className="text-xs text-muted-foreground">{job.requiredGpa.toFixed(1)}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 group">
                  {/* This link would go to a page showing applicants for this specific job */}
                  <Link href={`/company/applicants/${job.id}`}> 
                    <Users className="mr-2 h-4 w-4" /> View Applicants 
                    {/* Placeholder for applicant count */}
                    <Badge variant="default" className="ml-auto">{(Math.random()*20).toFixed(0)}</Badge> 
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" disabled>Edit</Button> {/* Placeholder for edit */}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <DataTablePlaceholder title="Your Job Postings" icon={Briefcase} message="You haven't posted any jobs yet. Click 'Create New Job' to get started." />
      )}
    </>
  );
}
