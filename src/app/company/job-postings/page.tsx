"use client";

import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Users, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CompanyJobPostingsPage() {
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCompanyJobs() {
      setIsLoading(true);
      setError(null);
      let companyId: string | null = null;
      if (typeof window !== 'undefined') {
        companyId = localStorage.getItem('companyId');
      }

      if (!companyId) {
        setError("Company ID not found. Please ensure you are logged in correctly.");
        setIsLoading(false);
        toast({
          title: "Authentication Error",
          description: "Could not identify your company. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(`/api/jobs?companyId=${companyId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch company jobs.");
        }
        const data: Job[] = await response.json();
        setCompanyJobs(data);
      } catch (e: any) {
        console.error("Failed to fetch company jobs:", e);
        setError(e.message || "An unexpected error occurred while fetching jobs.");
        toast({
          title: "Error Fetching Jobs",
          description: e.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanyJobs();
  }, [toast]);

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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-2 text-muted-foreground">Loading your job postings...</p>
        </div>
      ) : error ? (
        <Card className="text-center py-10">
          <CardContent>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-2" />
            <h3 className="text-lg font-semibold text-destructive">Error Loading Jobs</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : companyJobs.length > 0 ? (
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
                    <span className="text-xs font-semibold">Min GPA (0-10): </span>
                    <span className="text-xs text-muted-foreground">{job.requiredGpa.toFixed(1)}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex w-full">
                  <Button variant="outline" size="sm" asChild className="flex-1 group">
                    <Link href={`/company/applicants/${job.id}`}> 
                      <Users className="mr-2 h-4 w-4" /> View Applicants 
                    </Link>
                  </Button>
                </div>
                <div className="flex w-full gap-2">
                  <Button variant="ghost" size="sm" disabled className="flex-1">Edit</Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={async () => {
                    if (!window.confirm(`Are you sure you want to delete the job: ${job.title}?`)) return;
                    try {
                      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Failed to delete job');
                      }
                      setCompanyJobs(jobs => jobs.filter(j => j.id !== job.id));
                      toast({ title: 'Job Deleted', description: `Job "${job.title}" was deleted.`, variant: 'success' });
                    } catch (e: any) {
                      toast({ title: 'Delete Failed', description: e.message, variant: 'destructive' });
                    }
                  }}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
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

