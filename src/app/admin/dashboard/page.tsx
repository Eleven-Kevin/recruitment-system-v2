
import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPlaceholder } from "@/components/core/chart-placeholder";
import { Users, Building, Briefcase, BarChart3, UserCheck, Users2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Students", value: "1,250", icon: Users, color: "text-blue-500", href: "/admin/students" },
    { title: "Registered Companies", value: "85", icon: Building, color: "text-green-500", href: "/admin/companies" },
    { title: "Active Job Postings", value: "210", icon: Briefcase, color: "text-purple-500", href: "/admin/jobs" },
    { title: "Students Placed (This Year)", value: "320", icon: UserCheck, color: "text-orange-500", href: "/admin/schedules" },
  ];

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Oversee platform activities, manage data, and view key statistics."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button variant="link" asChild className="p-0 h-auto text-xs text-muted-foreground hover:text-accent">
                <Link href={stat.href}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <ChartPlaceholder title="Student Registration Trends" />
        <ChartPlaceholder title="Placement Success Rate by Department" />
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users2 className="text-accent"/>Recent Activities</CardTitle>
            <CardDescription>Overview of recent platform events and user actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "New company 'Innovatech Solutions' registered.",
                "Student 'Alice Smith' updated her profile.",
                "'Software Engineer' job posting by 'TechCorp' received 15 new applicants.",
                "Interview scheduled for 'Bob Williams' with 'Global Systems'.",
              ].map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground border-l-2 border-accent pl-3 py-1">
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
