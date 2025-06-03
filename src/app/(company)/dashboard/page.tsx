import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Send, Users, BookUser, ArrowRight, BarChart } from "lucide-react";
import { ChartPlaceholder } from "@/components/core/chart-placeholder";

export default function CompanyDashboardPage() {
  return (
    <>
      <PageHeader
        title="Company Dashboard"
        description="Welcome! Manage your job postings, view applicant profiles, and schedule interviews."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="text-accent"/>Job Postings</CardTitle>
            <CardDescription>Create new job listings and manage existing ones.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group">
              <Link href="/company/job-postings">
                Manage Jobs <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-accent"/>Applicants</CardTitle>
            <CardDescription>View and manage profiles of students who applied to your jobs.</CardDescription>
          </CardHeader>
          <CardContent>
             {/* This link might go to a general applicants overview or first job's applicants */}
            <Button asChild variant="outline" className="w-full group">
              <Link href="/company/job-postings"> 
                View Applicants <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookUser className="text-accent"/>Interview Schedules</CardTitle>
            <CardDescription>Organize and manage your interview calendar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group">
              <Link href="/company/interviews">
                Manage Interviews <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <ChartPlaceholder title="Applicant Funnel Overview" icon={BarChart} />
      </div>
    </>
  );
}
