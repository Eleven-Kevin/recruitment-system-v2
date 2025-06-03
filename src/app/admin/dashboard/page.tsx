
"use client";
import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPlaceholder } from "@/components/core/chart-placeholder";
import { Users, Building, Briefcase, BarChart3, UserCheck, Users2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  totalActiveJobPostings: number; // Changed to match API response
  totalPlacedStudents: number;    // Changed to match API response
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch dashboard stats:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dashboardItems = [
    { title: "Total Students", valueKey: "totalStudents" as keyof DashboardStats, icon: Users, color: "text-blue-500", href: "/admin/students" },
    { title: "Registered Companies", valueKey: "totalCompanies" as keyof DashboardStats, icon: Building, color: "text-green-500", href: "/admin/companies" },
    { title: "Active Job Postings", valueKey: "totalActiveJobPostings" as keyof DashboardStats, icon: Briefcase, color: "text-purple-500", href: "/admin/jobs" }, // Changed valueKey
    { title: "Students Placed (This Year)", valueKey: "totalPlacedStudents" as keyof DashboardStats, icon: UserCheck, color: "text-orange-500", href: "/admin/schedules" }, // Changed valueKey
  ];


  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Oversee platform activities, manage data, and view key statistics."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardItems.map((item) => (
          loading ? (
            <Card key={item.title} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-3/5 bg-muted rounded"></div> {/* Placeholder for title */}
                <div className="h-5 w-5 bg-muted rounded-full"></div> {/* Placeholder for icon */}
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/4 bg-muted rounded mb-2"></div> {/* Placeholder for value */}
                <div className="h-3 w-1/2 bg-muted rounded"></div> {/* Placeholder for link */}
              </CardContent>
            </Card>
          ) : (
          <Card key={item.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? stats[item.valueKey] : 'N/A'}</div>
              <Button variant="link" asChild className="p-0 h-auto text-xs text-muted-foreground hover:text-accent">
                <Link href={item.href}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
          )
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
