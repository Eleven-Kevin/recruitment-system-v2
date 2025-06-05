
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Company, Student } from '@/types'; // Added Student
import { pseudoHashPassword } from '@/lib/auth-utils'; // Added

// Get all companies (admin action)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const companies: Company[] = await db.all('SELECT id, name, description, website, logoUrl FROM companies ORDER BY name ASC');
    return NextResponse.json(companies);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch companies';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in GET /api/admin/companies:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Create a new company and a representative user (admin action)
export async function POST(request: NextRequest) {
  const db = await getDb();
  try {
    await db.run('BEGIN TRANSACTION'); // Start transaction

    const body = await request.json();
    const { name, description, website, logoUrl } = body as Partial<Omit<Company, 'id'>>;

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const existingCompany = await db.get('SELECT id FROM companies WHERE name = ?', name);
    if (existingCompany) {
      return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
    }

    const companyResult = await db.run(
      'INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)',
      name, description, website, logoUrl
    );

    if (!companyResult.lastID) {
      console.error('Failed to insert company into database. DB result:', companyResult);
      throw new Error('Failed to create company record.');
    }
    const newCompanyId = companyResult.lastID;

    // Create representative user for the company
    const companyUserNameForEmail = name.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const repUsername = `rep.${companyUserNameForEmail}${newCompanyId}@example.com`;
    // For prototype, use a simple, derivable password. DO NOT USE IN PRODUCTION.
    const repPassword = `Pass@${newCompanyId}!`; 
    const hashedRepPassword = pseudoHashPassword(repPassword);
    const repName = `${name} Representative`;

    const userResult = await db.run(
      'INSERT INTO students (name, email, password, role, companyId, studentId) VALUES (?, ?, ?, ?, ?, ?)',
      repName, repUsername, hashedRepPassword, 'company', newCompanyId, `COMPREP${newCompanyId}`
    );
    
    if (!userResult.lastID) {
      console.error('Failed to insert company representative user. DB result:', userResult);
      throw new Error('Failed to create company representative user.');
    }

    await db.run('COMMIT'); // Commit transaction

    const newCompany = await db.get('SELECT id, name, description, website, logoUrl FROM companies WHERE id = ?', newCompanyId);
    if (!newCompany) {
        console.error(`Failed to retrieve newly created company with ID ${newCompanyId}.`);
        // This ideally shouldn't happen if commit was successful.
        return NextResponse.json({ error: 'Failed to create company or retrieve details post-creation.' }, { status: 500 });
    }
    
    // Return company details along with the generated credentials for the representative
    return NextResponse.json({
      ...newCompany,
      representativeUser: {
        email: repUsername,
        password: repPassword, // Sending plain password for admin display - PROTOTYPE ONLY
      }
    }, { status: 201 });

  } catch (e: unknown) {
    await db.run('ROLLBACK'); // Rollback transaction on error
    let errorMessage = 'Failed to create company and user due to an internal error.';
    if (e instanceof Error) {
        if (e.message && e.message.toLowerCase().includes('unique constraint failed: companies.name')) {
          return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
        }
         if (e.message && e.message.toLowerCase().includes('unique constraint failed: students.email')) {
          // This case should be less likely with the generated email format, but good to handle
          return NextResponse.json({ error: 'Generated email for company representative already exists.' }, { status: 409 });
        }
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in POST /api/admin/companies:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
