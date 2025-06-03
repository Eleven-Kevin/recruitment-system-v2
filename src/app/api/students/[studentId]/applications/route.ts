
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Application } from '@/types';

// Get all applications for a specific student
export async function GET(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const db = await getDb();
    const studentId = parseInt(params.studentId, 10);

    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    // Ensure student exists (optional, but good practice)
    const student = await db.get('SELECT id FROM students WHERE id = ? AND role = ?', studentId, 'student');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const applications: Application[] = await db.all(
      `SELECT 
         a.id, a.studentId, a.jobId, a.status, a.appliedDate, a.notes,
         j.title as jobTitle, c.name as companyName
       FROM applications a
       JOIN jobs j ON a.jobId = j.id
       JOIN companies c ON j.companyId = c.id
       WHERE a.studentId = ?
       ORDER BY a.appliedDate DESC`,
      studentId
    );

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch student applications:', error);
    return NextResponse.json({ error: 'Failed to fetch student applications' }, { status: 500 });
  }
}

// TODO: POST method for a student to apply to a job
// Example: POST /api/students/[studentId]/applications with { jobId: number }
// This might be better as POST /api/jobs/[jobId]/apply and infer studentId from session
