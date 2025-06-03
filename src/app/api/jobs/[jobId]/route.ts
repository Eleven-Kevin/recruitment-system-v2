
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Job } from '@/types';

// Get a specific job by ID
export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const db = await getDb();
    const jobIdParam = parseInt(params.jobId, 10);

    if (isNaN(jobIdParam)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const job: Job | undefined = await db.get(
      `SELECT
         j.id, j.title, j.companyId, c.name as companyName, j.description,
         j.requiredSkills, j.requiredGpa, j.location, j.postedDate, j.status
       FROM jobs j
       JOIN companies c ON j.companyId = c.id
       WHERE j.id = ?`,
      jobIdParam
    );

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.requiredSkills && typeof job.requiredSkills === 'string') {
      try {
        job.requiredSkills = JSON.parse(job.requiredSkills);
      } catch (parseError) {
        console.error("Failed to parse job skills JSON:", parseError);
        job.requiredSkills = [];
      }
    } else if (!job.requiredSkills) {
        job.requiredSkills = [];
    }

    return NextResponse.json(job);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch job';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in GET /api/jobs/${params.jobId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Update a specific job by ID
export async function PUT(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const db = await getDb();
    const jobIdParam = parseInt(params.jobId, 10);

    if (isNaN(jobIdParam)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const body: Partial<Omit<Job, 'id' | 'companyName'>> = await request.json();
    const { title, companyId, description, requiredSkills, requiredGpa, location, status } = body;

    const fieldsToUpdate: { key: string, value: any }[] = [];
    if (title !== undefined) fieldsToUpdate.push({ key: 'title', value: title });
    if (companyId !== undefined) fieldsToUpdate.push({ key: 'companyId', value: companyId });
    if (description !== undefined) fieldsToUpdate.push({ key: 'description', value: description });
    if (requiredSkills !== undefined) fieldsToUpdate.push({ key: 'requiredSkills', value: JSON.stringify(requiredSkills) });
    if (requiredGpa !== undefined) fieldsToUpdate.push({ key: 'requiredGpa', value: requiredGpa });
    if (location !== undefined) fieldsToUpdate.push({ key: 'location', value: location });
    if (status !== undefined) fieldsToUpdate.push({ key: 'status', value: status });

    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ error: 'No fields to update provided' }, { status: 400 });
    }

    const setClause = fieldsToUpdate.map(f => `${f.key} = ?`).join(', ');
    const values = fieldsToUpdate.map(f => f.value);
    values.push(jobIdParam);

    const result = await db.run(`UPDATE jobs SET ${setClause} WHERE id = ?`, ...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Job not found or no changes made' }, { status: 404 });
    }

    const updatedJob = await db.get('SELECT j.*, c.name as companyName FROM jobs j JOIN companies c ON j.companyId = c.id WHERE j.id = ?', jobIdParam);
    if (!updatedJob) {
        console.error(`Failed to retrieve updated job with ID ${jobIdParam}.`);
        return NextResponse.json({ error: 'Failed to update job or retrieve it post-update.' }, { status: 500 });
    }

    if (updatedJob && updatedJob.requiredSkills && typeof updatedJob.requiredSkills === 'string') {
        updatedJob.requiredSkills = JSON.parse(updatedJob.requiredSkills);
    } else if (updatedJob && !updatedJob.requiredSkills) {
        updatedJob.requiredSkills = [];
    }

    return NextResponse.json(updatedJob);
  } catch (e: unknown) {
    let errorMessage = 'Failed to update job';
    if (e instanceof Error) {
        if (e.message.includes('FOREIGN KEY constraint failed')) {
            return NextResponse.json({ error: 'Invalid Company ID. Company does not exist.' }, { status: 400 });
        }
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in PUT /api/jobs/${params.jobId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete a specific job by ID
export async function DELETE(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const db = await getDb();
    const jobIdParam = parseInt(params.jobId, 10);

    if (isNaN(jobIdParam)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const result = await db.run('DELETE FROM jobs WHERE id = ?', jobIdParam);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
  } catch (e: unknown) {
    let errorMessage = 'Failed to delete job';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in DELETE /api/jobs/${params.jobId}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
