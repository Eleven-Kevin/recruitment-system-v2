"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/core/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { BarChart3, Users, Building, Briefcase, UserCheck } from "lucide-react";

export default function CollegeStatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const data = await res.json();
        setStats(data);
      } catch (e: any) {
        setError(e.message || "Error fetching statistics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      <PageHeader
        title="Recruitment Statistics"
        description="Analyze placement data, company participation, and student success rates."
      />
      {loading ? (
        <div className="flex justify-center items-center h-32">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : stats ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-accent"/>Students</CardTitle>
                <CardDescription>Total registered students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="text-accent"/>Companies</CardTitle>
                <CardDescription>Total companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCompanies}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="text-accent"/>Active Jobs</CardTitle>
                <CardDescription>Open job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalActiveJobPostings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck className="text-accent"/>Placed Students</CardTitle>
                <CardDescription>Students placed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPlacedStudents}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Branch-wise Placement Percentage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Branch-wise Placement %</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                {stats.branchPlacementStats && stats.branchPlacementStats.length > 0 ? (
                  <ChartContainer config={{}}>
                    <BarChart data={stats.branchPlacementStats} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" />
                      <YAxis label={{ value: 'Placement %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="placementPercentage" fill="#3498db" name="Placement %" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="text-muted-foreground">No branch data available for chart.</div>
                )}
              </CardContent>
            </Card>
            {/* Top Recruiting Companies Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Recruiting Companies</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                {stats.topRecruitingCompanies && stats.topRecruitingCompanies.length > 0 ? (
                  <ChartContainer config={{}}>
                    <BarChart data={stats.topRecruitingCompanies} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="companyName" />
                      <YAxis allowDecimals={false} label={{ value: 'Placed', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="placedCount" fill="#2ecc71" name="Placed Students" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="text-muted-foreground">No company placement data available for chart.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}
