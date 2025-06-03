
"use client"; // Make this a client component

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/core/page-header";
import { StudentProfileForm } from "@/components/student/profile-form";
import type { Student } from "@/types";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getStudentData(studentId: number | string): Promise<Student | null> {
  try {
    const res = await fetch(`/api/students/${studentId}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch student data", res.status, await res.text());
      return null; 
    }
    const student = await res.json();
    if (student && (student.skills === null || student.skills === undefined)) {
      student.skills = [];
    }
    return student;
  } catch (error) {
    console.error("Error in getStudentData:", error);
    return null;
  }
}


export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      if (typeof window !== 'undefined') {
        const studentId = localStorage.getItem('userId');
        if (studentId) {
          const data = await getStudentData(studentId);
          if (data) {
            setStudent(data);
          } else {
            setError("Could not load your profile. Please try logging in again.");
          }
        } else {
          setError("Not logged in. Please log in to view your profile.");
          // Optionally redirect to login: router.push('/login'); (if useRouter is imported)
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="ml-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
     return (
      <>
        <PageHeader title="My Profile" description="There was an issue loading your profile." />
        <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p className="text-destructive">{error}</p></CardContent>
        </Card>
      </>
    )
  }
  
  if (!student) {
     return (
      <>
        <PageHeader title="My Profile" description="No profile data found." />
         <Card>
            <CardHeader><CardTitle>Profile Not Found</CardTitle></CardHeader>
            <CardContent><p>We couldn't find your profile information. Please try logging in again or contact support.</p></CardContent>
        </Card>
      </>
    )
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
