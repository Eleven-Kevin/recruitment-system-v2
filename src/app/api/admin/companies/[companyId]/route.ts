import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Company } from '@/types';

// Get a specific company by ID (admin action)
export async function GET(request: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const db = await getDb();
    const id = parseInt(params.companyId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    const company: Company | undefined = await db.get('SELECT id, name, description, website, logoUrl FROM companies WHERE id = ?', id);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch company';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in GET /api/admin/companies/${params.companyId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Update a company (admin action)
export async function PUT(request: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const db = await getDb();
    const id = parseInt(params.companyId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, website, logoUrl } = body as Partial<Omit<Company, 'id'>>;

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Check if company exists before updating
    const existingCompany = await db.get('SELECT id FROM companies WHERE id = ?', id);
    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    // Check if new name conflicts with another company
    const nameConflict = await db.get('SELECT id FROM companies WHERE name = ? AND id != ?', name, id);
    if (nameConflict) {
      return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
    }


    const result = await db.run(
      'UPDATE companies SET name = ?, description = ?, website = ?, logoUrl = ? WHERE id = ?',
      name, description, website, logoUrl, id
    );

    if (result.changes === 0) {
      // This might happen if data is identical, or if ID not found (though checked above)
      const currentCompany = await db.get('SELECT id, name, description, website, logoUrl FROM companies WHERE id = ?', id);
      if (currentCompany) return NextResponse.json(currentCompany); // No effective change, return current
      return NextResponse.json({ error: 'Company not found or no changes made' }, { status: 404 });
    }

    const updatedCompany = await db.get('SELECT id, name, description, website, logoUrl FROM companies WHERE id = ?', id);
    if (!updatedCompany) {
        // Should not happen if result.changes > 0
        console.error(`Failed to retrieve updated company with ID ${id} post-update.`);
        return NextResponse.json({ error: 'Failed to update company or retrieve details post-update.' }, { status: 500 });
    }
    return NextResponse.json(updatedCompany);
  } catch (e: unknown) {
    let errorMessage = 'Failed to update company';
     if (e instanceof Error) {
        if (e.message && e.message.toLowerCase().includes('unique constraint failed: companies.name')) {
          return NextResponse.json({ error: 'A company with this name already exists.' }, { status: 409 });
        }
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in PUT /api/admin/companies/${params.companyId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete a company (admin action)
export async function DELETE(request: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const db = await getDb();
    const id = parseInt(params.companyId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }

    // Before deleting company, consider related users (company reps) or jobs.
    // For this prototype, we'll do a simple delete.
    // Optionally, set companyId to NULL for associated users if their accounts should remain.
    // Or delete associated users if they are tightly coupled.
    // await db.run('UPDATE students SET companyId = NULL WHERE companyId = ? AND role = ?', id, 'company');
    // For a simpler prototype, we might just delete the company. Associated jobs might be an issue due to FK constraints.
    // For safety, let's check if there are jobs associated.
    const associatedJobs = await db.get('SELECT COUNT(*) as count FROM jobs WHERE companyId = ?', id);
    if (associatedJobs && associatedJobs.count > 0) {
        return NextResponse.json({ error: `Cannot delete company. It has ${associatedJobs.count} associated job(s). Please reassign or delete them first.` }, { status: 409 });
    }
    
    // Similarly, check for company representative users
    const associatedUsers = await db.get('SELECT COUNT(*) as count FROM students WHERE companyId = ? AND role = ?', id, 'company');
    if (associatedUsers && associatedUsers.count > 0) {
        return NextResponse.json({ error: `Cannot delete company. It has ${associatedUsers.count} associated representative user(s). Please reassign or delete them first.` }, { status: 409 });
    }


    const result = await db.run('DELETE FROM companies WHERE id = ?', id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Company not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Company deleted successfully' }, { status: 200 });
  } catch (e: unknown) {
    let errorMessage = 'Failed to delete company';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in DELETE /api/admin/companies/${params.companyId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET /api/admin/companies/[companyId]/funnel
export async function GET_funnel(request: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const db = await getDb();
    const companyId = parseInt(params.companyId, 10);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }
    // Get all jobs for this company
    const jobs = await db.all('SELECT id FROM jobs WHERE companyId = ?', companyId);
    const jobIds = jobs.map((j: any) => j.id);
    if (jobIds.length === 0) {
      return NextResponse.json({ funnel: [] });
    }
    // Get counts by status for all applications to these jobs
    const funnel = await db.all(`
      SELECT status, COUNT(*) as count
      FROM applications
      WHERE jobId IN (${jobIds.map(() => '?').join(',')})
      GROUP BY status
    `, ...jobIds);
    return NextResponse.json({ funnel });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
  }
}

// GET /api/admin/companies/[companyId]/interviews
export async function GET_interviews(request: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const db = await getDb();
    const companyId = parseInt(params.companyId, 10);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
    }
    // Get all schedules for this company (direct or via job)
    const interviews = await db.all(`
      SELECT s.*, j.title as jobTitle
      FROM schedules s
      LEFT JOIN jobs j ON s.jobId = j.id
      WHERE s.companyId = ? OR j.companyId = ?
      ORDER BY s.date ASC, s.time ASC
    `, companyId, companyId);
    return NextResponse.json({ interviews });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch interview schedules' }, { status: 500 });
  }
}
