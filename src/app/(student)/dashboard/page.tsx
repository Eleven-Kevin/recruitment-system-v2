import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, User, Brain, ArrowRight } from "lucide-react";
import { ChartPlaceholder } from "@/components/core/chart-placeholder";

export default function StudentDashboardPage() {
  return (
    <>
      <PageHeader
        title="Student Dashboard"
        description="Welcome! Manage your profile, explore job recommendations, and track your applications."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="text-accent"/>My Profile</CardTitle>
            <CardDescription>Keep your academic details, skills, and preferences up-to-date.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group">
              <Link href="/student/profile">
                View/Edit Profile <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="text-accent"/>Job Recommendations</CardTitle>
            <CardDescription>Discover jobs tailored to your profile and application history.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group">
              <Link href="/student/job-recommendations">
                Explore Jobs <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="text-accent"/>My Applications</CardTitle>
            <CardDescription>Track the status of your job applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group">
              <Link href="/student/applications">
                View Applications <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <ChartPlaceholder title="Application Progress Overview" />
      </div>
    </>
  );
}
