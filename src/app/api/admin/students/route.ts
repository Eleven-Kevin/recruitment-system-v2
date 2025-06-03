
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Student } from '@/types';

// Create a new student (admin action)
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    // Ensure all required fields for student creation are present in the body
    // Password MUST be hashed in a real application. Storing plain text here for prototype simplicity.
    const body = await request.json();
    const { name, email, password, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl, role = 'student' } = body as Partial<Student>;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // In a real app, HASH THE PASSWORD here before storing it
    // const hashedPassword = await hashPassword(password);

    const skillsJson = skills ? JSON.stringify(skills) : null;

    const result = await db.run(
      'INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      name, email, password /* hashedPassword */, role, studentId, major, graduationYear, gpa, skillsJson, preferences, resumeUrl, profilePictureUrl
    );

    if (!result.lastID) {
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }

    const newStudent = await db.get('SELECT id, name, email, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl FROM students WHERE id = ?', result.lastID);
    if (newStudent && newStudent.skills && typeof newStudent.skills === 'string') {
        newStudent.skills = JSON.parse(newStudent.skills);
    } else if (newStudent && !newStudent.skills) {
        newStudent.skills = [];
    }

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create student:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed: students.email')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    if (error.message && error.message.includes('UNIQUE constraint failed: students.studentId')) {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
