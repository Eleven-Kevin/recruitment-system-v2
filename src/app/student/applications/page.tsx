
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/core/page-header";
import type { Application } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Building, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const StatusBadge = ({ status }: { status: Application['status'] }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let icon = <Clock className="h-3 w-3" />;
  let textColor = "text-muted-foreground";

  switch (status) {
    case 'applied':
      variant = 'outline';
      icon = <Clock className="h-3 w-3" />;
      textColor = "text-blue-600";
      break;
    case 'shortlisted':
    case 'interviewing':
      variant = 'secondary';
      icon = <CheckCircle className="h-3 w-3" />;
      textColor = "text-yellow-600";
      break;
    case 'offered':
    case 'accepted':
    case 'placed':
      variant = 'default';
      icon = <CheckCircle className="h-3 w-3" />;
      textColor = "text-green-600";
      break;
    case 'rejected':
      variant = 'destructive';
      icon = <XCircle className="h-3 w-3" />;
      textColor = "text-red-600";
      break;
    default:
      icon = <Clock className="h-3 w-3" />;
      textColor = "text-gray-600";
  }
  
  return (
    <Badge variant={variant} className={`capitalize flex items-center gap-1 text-xs border-${variant !== "outline" ? variant : "border"} ${textColor}`}>
      {icon}
      {status}
    </Badge>
  );
};


export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);
      if (typeof window !== 'undefined') {
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          setError("Please log in to view your applications.");
          setIsLoading(false);
          toast({ variant: "destructive", title: "Not Logged In", description: "You need to be logged in." });
          return;
        }

        try {
          const response = await fetch(`/api/students/${studentId}/applications`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch applications.");
          }
          const data: Application[] = await response.json();
          setApplications(data);
        } catch (e: any) {
          console.error("Failed to fetch applications:", e);
          setError(e.message || "An unexpected error occurred.");
          toast({ variant: "destructive", title: "Error", description: e.message });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false); // Should not happen in client component, but good fallback
      }
    };

    fetchApplications();
  }, [toast]);


  return (
    <>
      <PageHeader
        title="My Applications"
        description="Track the status of all your job applications."
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-2 text-muted-foreground">Loading your applications...</p>
        </div>
      ) : error ? (
        <Card className="text-center py-10">
          <CardContent>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-2" />
            <h3 className="text-lg font-semibold text-destructive">Error Loading Applications</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : applications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-headline leading-tight">{app.jobTitle}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm pt-1">
                      <Building className="h-4 w-4" /> {app.companyName}
                    </CardDescription>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-xs text-muted-foreground">
                  Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                </p>
                 {app.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {app.notes}</p>}
              </CardContent>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/student/job-details/${app.jobId}`}>View Job Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              You haven&apos;t applied to any jobs. Explore recommendations to get started!
            </p>
            <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/student/job-recommendations">Find Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
