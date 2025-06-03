
import { PageHeader } from "@/components/core/page-header";
import { StudentProfileForm } from "@/components/student/profile-form";
import type { Student } from "@/types";
import { notFound } from 'next/navigation';

async function getStudentData(studentId: number): Promise<Student | null> {
  // In a real app with auth, studentId would come from the logged-in user session
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/students/${studentId}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) return null;
    // For other errors, you might want to throw or handle differently
    console.error("Failed to fetch student data", res.status, await res.text());
    return null; 
  }
  const student = await res.json();
  // Ensure skills is an array, even if it's null/undefined from DB or API
  if (student && student.skills === null || student.skills === undefined) {
    student.skills = [];
  }
  return student;
}


export default async function StudentProfilePage() {
  // For demonstration, we'll fetch student with ID 1.
  // In a real app, this ID would come from the authenticated user's session.
  const studentId = 1; 
  const student = await getStudentData(studentId);

  if (!student) {
    // You could show a "profile not found" message or redirect
    // For now, we'll use Next.js notFound to render the nearest not-found.js or a default 404 page
    notFound(); 
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your academic details, skills, and career preferences."
      />
      <StudentProfileForm student={student} />
    </>
  );
}
