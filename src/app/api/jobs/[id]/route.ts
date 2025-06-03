
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Job } from '@/types';

// Get a specific job by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const jobId = parseInt(params.id, 10);

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const job: Job | undefined = await db.get(
      `SELECT 
         j.id, j.title, j.companyId, c.name as companyName, j.description, 
         j.requiredSkills, j.requiredGpa, j.location, j.postedDate, j.status 
       FROM jobs j
       JOIN companies c ON j.companyId = c.id
       WHERE j.id = ?`,
      jobId
    );

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.requiredSkills && typeof job.requiredSkills === 'string') {
      try {
        job.requiredSkills = JSON.parse(job.requiredSkills);
      } catch (e) {
        console.error("Failed to parse job skills JSON:", e);
        job.requiredSkills = [];
      }
    } else if (!job.requiredSkills) {
        job.requiredSkills = [];
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// Update a specific job by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const jobId = parseInt(params.id, 10);

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const body: Partial<Omit<Job, 'id' | 'companyName'>> = await request.json();
    const { title, companyId, description, requiredSkills, requiredGpa, location, status, postedDate } = body;

    const fieldsToUpdate: { key: string, value: any }[] = [];
    if (title !== undefined) fieldsToUpdate.push({ key: 'title', value: title });
    if (companyId !== undefined) fieldsToUpdate.push({ key: 'companyId', value: companyId });
    if (description !== undefined) fieldsToUpdate.push({ key: 'description', value: description });
    if (requiredSkills !== undefined) fieldsToUpdate.push({ key: 'requiredSkills', value: JSON.stringify(requiredSkills) });
    if (requiredGpa !== undefined) fieldsToUpdate.push({ key: 'requiredGpa', value: requiredGpa });
    if (location !== undefined) fieldsToUpdate.push({ key: 'location', value: location });
    if (status !== undefined) fieldsToUpdate.push({ key: 'status', value: status });
    // postedDate might not be updatable by user directly, or only in specific cases
    // For now, let's assume it's not part of user update for simplicity. If needed, add:
    // if (postedDate !== undefined) fieldsToUpdate.push({ key: 'postedDate', value: postedDate });


    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ error: 'No fields to update provided' }, { status: 400 });
    }
    
    const setClause = fieldsToUpdate.map(f => `${f.key} = ?`).join(', ');
    const values = fieldsToUpdate.map(f => f.value);
    values.push(jobId);

    const result = await db.run(`UPDATE jobs SET ${setClause} WHERE id = ?`, ...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Job not found or no changes made' }, { status: 404 });
    }

    const updatedJob = await db.get('SELECT j.*, c.name as companyName FROM jobs j JOIN companies c ON j.companyId = c.id WHERE j.id = ?', jobId);
    if (updatedJob && updatedJob.requiredSkills && typeof updatedJob.requiredSkills === 'string') {
        updatedJob.requiredSkills = JSON.parse(updatedJob.requiredSkills);
    } else if (updatedJob && !updatedJob.requiredSkills) {
        updatedJob.requiredSkills = [];
    }
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Failed to update job:', error);
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
        return NextResponse.json({ error: 'Invalid Company ID. Company does not exist.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// Delete a specific job by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const jobId = parseInt(params.id, 10);

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    // Optional: Check for related applications before deleting if strict referential integrity is desired
    // For simplicity, directly deleting. DB constraints should handle if applications exist.
    // Or, you could delete related applications first.

    const result = await db.run('DELETE FROM jobs WHERE id = ?', jobId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete job:', error);
    // Handle potential foreign key constraint errors if applications depend on this job
    // (though typically onDelete cascade/restrict would be set at DB level)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
