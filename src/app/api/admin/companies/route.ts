
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Company } from '@/types';

// Get all companies (admin action)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const companies: Company[] = await db.all('SELECT id, name, description, website, logoUrl FROM companies ORDER BY name ASC');
    return NextResponse.json(companies);
  } catch (error: any) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

// TODO: Add POST, PUT, DELETE for companies as needed by admin
