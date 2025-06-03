
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Student } from '@/types';

// Get a specific student by ID
export async function GET(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const db = await getDb();
    const studentIdParam = parseInt(params.studentId, 10);

    if (isNaN(studentIdParam)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const student: Student | undefined = await db.get(
      'SELECT id, name, email, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl, companyId FROM students WHERE id = ?',
      studentIdParam
    );

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (student.skills && typeof student.skills === 'string') {
      try {
        student.skills = JSON.parse(student.skills);
      } catch (parseError) {
        console.error("Failed to parse student skills JSON:", parseError);
        student.skills = []; 
      }
    } else if (!student.skills) {
        student.skills = [];
    }

    return NextResponse.json(student);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch student';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in GET /api/students/${params.studentId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Update a specific student by ID
export async function PUT(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const db = await getDb();
    const studentIdParam = parseInt(params.studentId, 10);

    if (isNaN(studentIdParam)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const body: Partial<Student> = await request.json();
    const { name, email, studentId: studentIdField, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl } = body;

    if (!name || !email) {
        return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const skillsJson = skills && Array.isArray(skills) ? JSON.stringify(skills) : null;

    const result = await db.run(
      'UPDATE students SET name = ?, email = ?, studentId = ?, major = ?, graduationYear = ?, gpa = ?, skills = ?, preferences = ?, resumeUrl = ?, profilePictureUrl = ? WHERE id = ?',
      name, email, studentIdField, major, graduationYear, gpa, skillsJson, preferences, resumeUrl, profilePictureUrl, studentIdParam
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Student not found or no changes made' }, { status: 404 });
    }

    const updatedStudent = await db.get('SELECT id, name, email, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl, companyId FROM students WHERE id = ?', studentIdParam);
    if (!updatedStudent) {
        console.error(`Failed to retrieve updated student with ID ${studentIdParam}.`);
        return NextResponse.json({ error: 'Failed to update student or retrieve details post-update.' }, { status: 500 });
    }

    if (updatedStudent && updatedStudent.skills && typeof updatedStudent.skills === 'string') {
      updatedStudent.skills = JSON.parse(updatedStudent.skills);
    } else if (updatedStudent && !updatedStudent.skills) {
      updatedStudent.skills = [];
    }

    return NextResponse.json(updatedStudent);
  } catch (e: unknown) {
    let errorMessage = 'Failed to update student';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in PUT /api/students/${params.studentId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete a specific student by ID
export async function DELETE(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const db = await getDb();
    const studentIdParam = parseInt(params.studentId, 10);

    if (isNaN(studentIdParam)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const result = await db.run('DELETE FROM students WHERE id = ?', studentIdParam);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (e: unknown) {
    let errorMessage = 'Failed to delete student';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in DELETE /api/students/${params.studentId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
