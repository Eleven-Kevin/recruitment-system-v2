
import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import type { Application } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Building, CheckCircle, XCircle, Clock } from "lucide-react";

// Mock data for applications
const mockApplications: Application[] = [
  {
    id: "app1",
    jobId: "job1",
    studentId: "student123",
    jobTitle: "Software Engineer Intern",
    companyName: "Tech Solutions Inc.",
    status: "applied",
    appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "app2",
    jobId: "job2",
    studentId: "student123",
    jobTitle: "Data Analyst Co-op",
    companyName: "Innovatech",
    status: "shortlisted",
    appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: "app3",
    jobId: "job3",
    studentId: "student123",
    jobTitle: "Web Developer",
    companyName: "Creative Designs LLC",
    status: "interviewing",
    appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: "app4",
    jobId: "job4",
    studentId: "student123",
    jobTitle: "AI Research Assistant",
    companyName: "Future AI Labs",
    status: "rejected",
    appliedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
  },
];

const StatusBadge = ({ status }: { status: Application['status'] }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let icon = <Clock className="h-3 w-3" />;
  if (status === 'shortlisted' || status === 'interviewing') { variant = 'secondary'; icon = <CheckCircle className="h-3 w-3 text-green-500" />; }
  if (status === 'offered' || status === 'accepted') { variant = 'default'; icon = <CheckCircle className="h-3 w-3 text-green-500" />; }
  if (status === 'rejected') { variant = 'destructive'; icon = <XCircle className="h-3 w-3" />; }
  
  return (
    <Badge variant={variant} className="capitalize flex items-center gap-1 text-xs">
      {icon}
      {status}
    </Badge>
  );
};


export default function StudentApplicationsPage() {
  return (
    <>
      <PageHeader
        title="My Applications"
        description="Track the status of all your job applications."
      />
      {mockApplications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-headline">{app.jobTitle}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <Building className="h-4 w-4" /> {app.companyName}
                    </CardDescription>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                </p>
                {/* Future: Add link to job details or company */}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DataTablePlaceholder title="My Applications" message="You haven't applied to any jobs yet." icon={FileText} />
      )}
    </>
  );
}
