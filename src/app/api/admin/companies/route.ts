
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Company } from '@/types';

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

// Create a new company (admin action)
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { name, description, website, logoUrl } = body as Partial<Omit<Company, 'id'>>;

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Check if company name already exists
    const existingCompany = await db.get('SELECT id FROM companies WHERE name = ?', name);
    if (existingCompany) {
      return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
    }

    const result = await db.run(
      'INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)',
      name, description, website, logoUrl
    );

    if (!result.lastID) {
      console.error('Failed to insert company into database. DB result:', result);
      return NextResponse.json({ error: 'Failed to create company. Please check server logs.' }, { status: 500 });
    }

    const newCompany = await db.get('SELECT id, name, description, website, logoUrl FROM companies WHERE id = ?', result.lastID);
    if (!newCompany) {
        console.error(`Failed to retrieve newly created company with ID ${result.lastID}.`);
        return NextResponse.json({ error: 'Failed to create company or retrieve details post-creation.' }, { status: 500 });
    }
    
    return NextResponse.json(newCompany, { status: 201 });

  } catch (e: unknown) {
    let errorMessage = 'Failed to create company due to an internal error.';
    if (e instanceof Error) {
        // Catch SQLite unique constraint error for name, though the explicit check above should catch it first.
        if (e.message && e.message.toLowerCase().includes('unique constraint failed: companies.name')) {
          return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
        }
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in POST /api/admin/companies:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// TODO: Add PUT, DELETE for companies as needed by admin
