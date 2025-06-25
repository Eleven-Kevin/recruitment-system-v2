"use client";
import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { Student } from "@/types";

export default function CollegeBranchStudentsPage({ params }: { params: { branch: string } }) {
  const branchName = params.branch === 'all' ? 'All Students' : decodeURIComponent(params.branch).replace(/-/g, ' ');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/students');
        if (!res.ok) throw new Error('Failed to fetch students');
        let data: Student[] = await res.json();
        if (params.branch !== 'all') {
          data = data.filter(s => s.major && s.major.toLowerCase() === branchName.toLowerCase());
        }
        setStudents(data);
      } catch (e: any) {
        setError(e.message || 'Error fetching students');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, [params.branch, branchName]);

  return (
    <>
      <PageHeader
        title={`Student Details: ${branchName}`}
        description={`View academic information and placement status for students in the ${branchName} ${params.branch !== 'all' ? 'branch' : ''}.`}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-32">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : students.length === 0 ? (
        <div className="text-center text-muted-foreground">No students found for this branch.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Student ID</th>
                <th className="border px-2 py-1">Major</th>
                <th className="border px-2 py-1">Graduation Year</th>
                <th className="border px-2 py-1">GPA</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td className="border px-2 py-1">{student.name}</td>
                  <td className="border px-2 py-1">{student.email}</td>
                  <td className="border px-2 py-1">{student.studentId}</td>
                  <td className="border px-2 py-1">{student.major}</td>
                  <td className="border px-2 py-1">{student.graduationYear || '-'}</td>
                  <td className="border px-2 py-1">{student.gpa !== undefined && student.gpa !== null ? student.gpa.toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
