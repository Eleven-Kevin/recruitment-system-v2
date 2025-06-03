
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Student } from '@/types';
import { pseudoHashPassword } from '@/lib/auth-utils';

// Get all students (admin action)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const students: Student[] = await db.all('SELECT id, name, email, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl FROM students WHERE role = ? ORDER BY name ASC', 'student');

    students.forEach(student => {
      if (student.skills && typeof student.skills === 'string') {
        try {
          student.skills = JSON.parse(student.skills);
        } catch (parseError) {
          console.error("Failed to parse student skills JSON for student ID " + student.id + ":", parseError);
          student.skills = [];
        }
      } else if (!student.skills) {
        student.skills = [];
      }
    });

    return NextResponse.json(students);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch students';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in GET /api/admin/students:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


// Create a new student (admin action)
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { name, email, password, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl, role = 'student' } = body as Partial<Student>;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const hashedPassword = pseudoHashPassword(password);
    const skillsJson = skills && Array.isArray(skills) ? JSON.stringify(skills) : null;

    const result = await db.run(
      'INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      name, email, hashedPassword, role, studentId, major, graduationYear, gpa, skillsJson, preferences, resumeUrl, profilePictureUrl
    );

    if (!result.lastID) {
        return NextResponse.json({ error: 'Failed to create student. Please check server logs.' }, { status: 500 });
    }

    const newStudent = await db.get('SELECT id, name, email, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl FROM students WHERE id = ?', result.lastID);
    if (!newStudent) {
        console.error(`Failed to retrieve newly created student with ID ${result.lastID}.`);
        return NextResponse.json({ error: 'Failed to create student or retrieve details post-creation.' }, { status: 500 });
    }

    if (newStudent && newStudent.skills && typeof newStudent.skills === 'string') {
        newStudent.skills = JSON.parse(newStudent.skills);
    } else if (newStudent && !newStudent.skills) {
        newStudent.skills = [];
    }

    return NextResponse.json(newStudent, { status: 201 });
  } catch (e: unknown) {
    let errorMessage = 'Failed to create student due to an internal error.';
    if (e instanceof Error) {
        if (e.message && e.message.includes('UNIQUE constraint failed: students.email')) {
          return NextResponse.json({ error: 'Email already exists. Please use a different email.' }, { status: 409 });
        }
        if (e.message && e.message.includes('UNIQUE constraint failed: students.studentId')) {
          return NextResponse.json({ error: 'Student ID already exists. Please use a different Student ID.' }, { status: 409 });
        }
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in POST /api/admin/students:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
