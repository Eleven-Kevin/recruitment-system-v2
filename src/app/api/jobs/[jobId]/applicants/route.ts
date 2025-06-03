
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Application, Student } from '@/types';

// Get all applicants for a specific job
export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const db = await getDb();
    const jobId = parseInt(params.jobId, 10);

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const job = await db.get('SELECT id FROM jobs WHERE id = ?', jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const applicantsData: Array<any> = await db.all(
      `SELECT 
         s.id as student_id, s.name as student_name, s.email as student_email, s.major as student_major, 
         s.gpa as student_gpa, s.skills as student_skills, s.profilePictureUrl as student_profilePictureUrl,
         s.resumeUrl as student_resumeUrl,
         a.id as application_id, a.studentId as app_student_id, a.jobId as app_job_id, a.status as application_status, 
         a.appliedDate as application_appliedDate, a.notes as application_notes
       FROM applications a
       JOIN students s ON a.studentId = s.id
       WHERE a.jobId = ?
       ORDER BY a.appliedDate DESC`,
      jobId
    );
    
    const result = applicantsData.map(row => {
        let skillsArray: string[] = [];
        if (row.student_skills && typeof row.student_skills === 'string') {
            try {
                skillsArray = JSON.parse(row.student_skills);
            } catch (parseError) {
                console.error("Failed to parse skills JSON for student ID " + row.student_id + ":", parseError);
            }
        } else if (Array.isArray(row.student_skills)) {
             skillsArray = row.student_skills; 
        }

        return {
            student: {
                id: row.student_id,
                name: row.student_name,
                email: row.student_email,
                major: row.student_major,
                gpa: row.student_gpa,
                skills: skillsArray,
                profilePictureUrl: row.student_profilePictureUrl,
                resumeUrl: row.student_resumeUrl,
            } as Partial<Student>, 
            application: {
                id: row.application_id,
                studentId: row.app_student_id,
                jobId: row.app_job_id,
                status: row.application_status,
                appliedDate: row.application_appliedDate,
                notes: row.application_notes
            } as Application
        }
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch job applicants';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in GET /api/jobs/${params.jobId}/applicants:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
