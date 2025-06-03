
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
      'SELECT id, role, name, email, password, companyId FROM students WHERE email = ?',
      email
    );

    if (!user) { 
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    
    if (!user.password) { 
      console.error(`User with email ${email} found, but no password is set in the database.`);
      return NextResponse.json({ error: 'Invalid email or password. Account configuration issue.' }, { status: 401 });
    }

    const isPasswordValid = verifyPseudoHashedPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const responsePayload: { id: number; role?: Student['role']; name: string; email: string; companyId?: number } = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    if (user.role === 'company' && user.companyId) {
      responsePayload.companyId = user.companyId;
    }

    return NextResponse.json(responsePayload);

  } catch (e: unknown) {
    let errorMessage = 'Login failed due to an internal error. Please try again later.';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in POST /api/auth/login:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
