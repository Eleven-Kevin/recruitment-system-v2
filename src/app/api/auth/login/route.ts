
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Student } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    // Note: Password is not validated in this prototype version for simplicity.
    // In a real app, you MUST hash the provided password and compare it with a stored hash.

    const user: Pick<Student, 'id' | 'role' | 'name' | 'email'> | undefined = await db.get(
      'SELECT id, role, name, email FROM students WHERE email = ?',
      email
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials or user not found' }, { status: 401 });
    }

    // Do NOT send the password back, even if it were hashed.
    return NextResponse.json({ id: user.id, role: user.role, name: user.name, email: user.email });

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login failed due to an internal error' }, { status: 500 });
  }
}
