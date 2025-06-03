
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
        } catch (e) {
          console.error("Failed to parse student skills JSON for student ID " + student.id + ":", e);
          student.skills = [];
        }
      } else if (!student.skills) {
        student.skills = [];
      }
    });
    
    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
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
    const skillsJson = skills ? JSON.stringify(skills) : null;

    const result = await db.run(
      'INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      name, email, hashedPassword, role, studentId, major, graduationYear, gpa, skillsJson, preferences, resumeUrl, profilePictureUrl
    );

    if (!result.lastID) {
        return NextResponse.json({ error: 'Failed to create student. Please check server logs.' }, { status: 500 });
    }

    // Do not return password, even hashed, in the response
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
      return NextResponse.json({ error: 'Email already exists. Please use a different email.' }, { status: 409 });
    }
    if (error.message && error.message.includes('UNIQUE constraint failed: students.studentId')) {
      return NextResponse.json({ error: 'Student ID already exists. Please use a different Student ID.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create student due to an internal error.' }, { status: 500 });
  }
}
