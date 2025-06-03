
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Student } from '@/types';
import { verifyPseudoHashedPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user: Student | undefined = await db.get(
      'SELECT id, role, name, email, password FROM students WHERE email = ?',
      email
    );

    if (!user) { // Check if user exists first
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    // If user exists, then check for the password
    if (!user.password) { 
      // This case implies an issue with the user's account data (e.g., password not set)
      console.error(`User with email ${email} found, but no password is set in the database.`);
      return NextResponse.json({ error: 'Invalid email or password. Account configuration issue.' }, { status: 401 });
    }

    const isPasswordValid = verifyPseudoHashedPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Do NOT send the password (even hashed) back in the response.
    return NextResponse.json({ id: user.id, role: user.role, name: user.name, email: user.email });

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login failed due to an internal error. Please try again later.' }, { status: 500 });
  }
}
