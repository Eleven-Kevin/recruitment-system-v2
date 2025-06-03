
"use client";
import { PageHeader } from "@/components/core/page-header";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import type { Job } from "@/types";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs"); // Using existing endpoint for all jobs
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <>
      <PageHeader
        title="Manage Job Postings"
        description="Review, approve, and manage all job postings on the platform."
        // Add actions for creating new jobs if admin can do this directly
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-2 text-muted-foreground">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-10">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Jobs Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Job postings will appear here.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card text-card-foreground shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.companyName || "N/A"}</TableCell>
                  <TableCell>{job.location || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'open' ? 'secondary' : 'outline'} className="capitalize">
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(job.postedDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {/* Future: Edit/Delete/Approve buttons */}
                    <Button variant="ghost" size="sm" disabled>Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
