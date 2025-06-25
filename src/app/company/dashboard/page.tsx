"use client";
import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Send, Users, BookUser, ArrowRight, BarChart as BarChartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function CompanyDashboardPage() {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [loadingFunnel, setLoadingFunnel] = useState(true);

  useEffect(() => {
    async function fetchFunnel() {
      setLoadingFunnel(true);
      let companyId = null;
      if (typeof window !== 'undefined') {
        companyId = localStorage.getItem('companyId');
      }
      if (!companyId) {
        setFunnel([]);
        setLoadingFunnel(false);
        return;
      }
      const res = await fetch(`/api/admin/companies/${companyId}/funnel`);
      if (res.ok) {
        const data = await res.json();
        setFunnel(data.funnel || []);
      } else {
        setFunnel([]);
      }
      setLoadingFunnel(false);
    }
    fetchFunnel();
  }, []);

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
        <Card>
          <CardHeader>
            <CardTitle>Applicant Funnel Overview</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            {loadingFunnel ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : funnel.length > 0 ? (
              <ChartContainer config={{}}>
                <BarChart data={funnel} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3498db" name="Applicants" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground">No applicant data available for funnel.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
