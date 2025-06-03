
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

// TODO: Add POST, PUT, DELETE for companies as needed by admin
