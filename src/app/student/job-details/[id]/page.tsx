"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/core/page-header";
import type { Job, Application } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Briefcase, MapPin, CalendarDays, GraduationCap, ListChecks, DollarSign, Send, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function StudentJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('userId');
      setStudentId(id);
    }
  }, []);

  useEffect(() => {
    if (jobId) {
      const fetchJobDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/jobs/\${jobId}`);
          if (!res.ok) {
            if (res.status === 404) {
              throw new Error("Job not found. It might have been removed or the link is incorrect.");
            }
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch job details.");
          }
          const data: Job = await res.json();
          setJob(data);

          // Check if student has already applied
          if (studentId && data) {
            const appRes = await fetch(`/api/students/\${studentId}/applications`);
            if (appRes.ok) {
              const applications: Application[] = await appRes.json();
              if (applications.some(app => app.jobId === data.id)) {
                setHasApplied(true);
              }
            }
          }

        } catch (e: any) {
          console.error("Error fetching job details:", e);
          setError(e.message || "An unexpected error occurred while fetching job details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [jobId, studentId]);

  const handleApply = async () => {
    if (!studentId || !job) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot apply: User or job information is missing.",
      });
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch(`/api/students/\${studentId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit application.");
      }

      setHasApplied(true);
      toast({
        title: "Application Submitted!",
        description: `You have successfully applied for \${job.title}.`,
        variant: "default",
      });
    } catch (e: any) {
      console.error("Failed to apply:", e);
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: e.message || "Could not submit your application. Please try again.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Error" />
        <Card className="text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Oops! Something went wrong.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <PageHeader title="Job Not Found" />
         <Card className="text-center">
          <CardHeader>
             <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Job Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The job you are looking for does not exist or may have been removed.</p>
            <Button onClick={() => router.push('/student/job-recommendations')}>View Other Jobs</Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={job.title}
        description={
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building className="h-4 w-4 text-accent" /> {job.companyName || "N/A"}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-accent" /> {job.location}</span>}
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4 text-accent" /> Posted: {format(new Date(job.postedDate), "PPP")}</span>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {(job.requiredSkills && job.requiredSkills.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>Required Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.requiredGpa && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><GraduationCap className="h-4 w-4"/>Min. GPA (0-10):</span>
                  <span className="font-semibold">{job.requiredGpa.toFixed(1)}</span>
                </div>
              )}
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4"/>Salary:</span>
                  <span className="font-semibold">Competitive (Not specified)</span>
              </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Briefcase className="h-4 w-4"/>Job Type:</span>
                  <span className="font-semibold">Full-time (Assumed)</span>
              </div>
            </CardContent>
            <CardFooter>
              {hasApplied ? (
                <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" /> Already Applied
                </Button>
              ) : (
                <Button onClick={handleApply} disabled={isApplying || !studentId} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isApplying ? "Submitting..." : "Apply for this Job"}
                </Button>
              )}
            </CardFooter>
             {!studentId && <p className="text-xs text-center text-destructive p-2">Please log in to apply.</p>}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About {job.companyName || "the Company"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Further details about the company would be displayed here. 
                For now, you can visit their website if available.
              </p>
              {/* Add company website link if available in job data, or fetch company details */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}