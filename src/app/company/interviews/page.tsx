"use client";
import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CompanyInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      let companyId = null;
      if (typeof window !== 'undefined') {
        companyId = localStorage.getItem('companyId');
      }
      if (!companyId) {
        setInterviews([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/admin/companies/${companyId}/interviews`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      } else {
        setInterviews([]);
      }
      setLoading(false);
    }
    fetchInterviews();
  }, []);

  return (
    <>
      <PageHeader
        title="Manage Interview Schedules"
        description="Organize, view, and update interview slots for applicants."
      />
      <Card>
        <CardHeader>
          <CardTitle>Interview Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : interviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Title</th>
                    <th className="border px-2 py-1">Job</th>
                    <th className="border px-2 py-1">Date</th>
                    <th className="border px-2 py-1">Time</th>
                    <th className="border px-2 py-1">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((i) => (
                    <tr key={i.id}>
                      <td className="border px-2 py-1">{i.title}</td>
                      <td className="border px-2 py-1">{i.jobTitle || '-'}</td>
                      <td className="border px-2 py-1">{i.date ? new Date(i.date).toLocaleDateString() : '-'}</td>
                      <td className="border px-2 py-1">{i.time || '-'}</td>
                      <td className="border px-2 py-1">{i.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground">No interview schedules found.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
