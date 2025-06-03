import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPlaceholder } from "@/components/core/chart-placeholder";
import { Users, BarChart3, Building, ArrowRight, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CollegeDashboardPage() {
  return (
    <>
      <PageHeader
        title="College Dashboard"
        description="Access branch-specific student details and view overall recruitment statistics."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-accent"/>Student Details</CardTitle>
            <CardDescription>View and manage student data by branch or department.</CardDescription>
          </CardHeader>
          <CardContent>
             {/* Link to a default branch or an overview page */}
            <Button asChild variant="outline" className="w-full group">
              <Link href="/college/students/all">
                View Students <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="text-accent"/>Recruitment Statistics</CardTitle>
            <CardDescription>Analyze placement trends, company engagement, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group">
              <Link href="/college/statistics">
                View Statistics <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="text-accent"/>Company Engagement</CardTitle>
            <CardDescription>Track companies participating in placements and their hiring patterns.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* This could link to a dedicated company engagement page or be part of statistics */}
            <Button asChild variant="outline" className="w-full group" disabled>
              <Link href="#"> 
                Analyze Engagement <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <ChartPlaceholder title="Branch-wise Placement Percentage" />
        <ChartPlaceholder title="Top Recruiting Companies" />
      </div>
    </>
  );
}
