
import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getCompanyJobs(): Promise<Job[]> {
  // In a real app, this would filter by the logged-in company's ID.
  // For now, fetching all jobs using a relative path.
  // TODO: When company login is fully implemented, pass companyId as query param
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error("Error: NEXT_PUBLIC_APP_URL is not defined. Cannot fetch company jobs.");
    return [];
  }
  const res = await fetch(`${baseUrl}/api/jobs`, { cache: 'no-store' });
  if (!res.ok) {
    console.error("Failed to fetch jobs", res.status, await res.text());
    return [];
  }
  return res.json();
}


export default async function CompanyJobPostingsPage() {
  const companyJobs = await getCompanyJobs();

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
      {companyJobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companyJobs.map((job) => (
            <Card key={job.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-headline">{job.title}</CardTitle>
                  <Badge variant={job.status === 'open' ? 'secondary' : 'outline'} className="capitalize">
                    {job.status}
                  </Badge>
                </div>
                <CardDescription>
                  {job.companyName} {job.location ? `\u2022 ${job.location}` : ''} &bull; Posted: {new Date(job.postedDate).toLocaleDateString()}
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
                  <Link href={`/company/applicants/${job.id}`}> 
                    <Users className="mr-2 h-4 w-4" /> View Applicants 
                    {/* Placeholder for applicant count - real count would require another query/API */}
                    <Badge variant="default" className="ml-auto">{(Math.floor(Math.random()*5) +1)}</Badge> 
                  </Link>
                </Button>
                {/* TODO: Implement Edit functionality linking to a pre-filled JobPostingForm */}
                <Button variant="ghost" size="sm" disabled>Edit</Button> 
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <DataTablePlaceholder title="Your Job Postings" icon={Briefcase} message="You haven't posted any jobs yet or no jobs found. Click 'Create New Job' to get started." />
      )}
    </>
  );
}
