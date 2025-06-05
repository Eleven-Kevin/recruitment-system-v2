
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
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch student applications';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in GET /api/students/${params.studentId}/applications:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Apply for a job
export async function POST(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const db = await getDb();
    const studentId = parseInt(params.studentId, 10);

    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const student = await db.get('SELECT id FROM students WHERE id = ? AND role = ?', studentId, 'student');
    if (!student) {
      return NextResponse.json({ error: 'Student not found or not authorized' }, { status: 404 });
    }

    const job = await db.get('SELECT id FROM jobs WHERE id = ?', jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existingApplication = await db.get(
      'SELECT id FROM applications WHERE studentId = ? AND jobId = ?',
      studentId, jobId
    );

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job.' }, { status: 409 });
    }

    const appliedDate = new Date().toISOString();
    const result = await db.run(
      'INSERT INTO applications (studentId, jobId, status, appliedDate) VALUES (?, ?, ?, ?)',
      studentId, jobId, 'applied', appliedDate
    );

    if (!result.lastID) {
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    const newApplication = await db.get(
      `SELECT
         a.id, a.studentId, a.jobId, a.status, a.appliedDate, a.notes,
         j.title as jobTitle, c.name as companyName
       FROM applications a
       JOIN jobs j ON a.jobId = j.id
       JOIN companies c ON j.companyId = c.id
       WHERE a.id = ?`,
      result.lastID
    );

    return NextResponse.json(newApplication, { status: 201 });

  } catch (e: unknown) {
    let errorMessage = 'Failed to submit application';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in POST /api/students/${params.studentId}/applications:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
