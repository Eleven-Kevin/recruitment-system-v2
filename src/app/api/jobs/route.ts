
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Job } from '@/types';

// Get all jobs, optionally filtered by companyId
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    let query = `
      SELECT
        j.id, j.title, j.companyId, c.name as companyName, j.description,
        j.requiredSkills, j.requiredGpa, j.location, j.postedDate, j.status
      FROM jobs j
      JOIN companies c ON j.companyId = c.id
    `;
    const queryParams: any[] = [];

    if (companyId) {
      const parsedCompanyId = parseInt(companyId, 10);
      if (isNaN(parsedCompanyId)) {
        return NextResponse.json({ error: 'Invalid companyId format' }, { status: 400 });
      }
      query += ' WHERE j.companyId = ?';
      queryParams.push(parsedCompanyId);
    }
    query += ' ORDER BY j.postedDate DESC';

    const jobs: Job[] = await db.all(query, ...queryParams);

    jobs.forEach(job => {
      if (job.requiredSkills && typeof job.requiredSkills === 'string') {
        try {
          job.requiredSkills = JSON.parse(job.requiredSkills);
        } catch (e) {
          console.error("Failed to parse job skills JSON for job ID " + job.id + ":", e);
          job.requiredSkills = [];
        }
      } else if (!job.requiredSkills) {
        job.requiredSkills = [];
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// Create a new job
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body: Omit<Job, 'id' | 'postedDate' | 'status' | 'companyName'> & {companyId: number} = await request.json();

    const { title, companyId, description, requiredSkills, requiredGpa, location } = body;

    if (!title || !companyId || !description) {
      return NextResponse.json({ error: 'Title, Company ID, and Description are required' }, { status: 400 });
    }

    // Verify company exists
    const company = await db.get('SELECT id FROM companies WHERE id = ?', companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found. Cannot create job.' }, { status: 400 });
    }


    const skillsJson = requiredSkills ? JSON.stringify(requiredSkills) : null;
    const postedDate = new Date().toISOString();
    const status = 'open';

    const result = await db.run(
      'INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      title, companyId, description, skillsJson, requiredGpa, location, postedDate, status
    );

    if (!result.lastID) {
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const newJob = await db.get('SELECT j.*, c.name as companyName FROM jobs j JOIN companies c ON j.companyId = c.id WHERE j.id = ?', result.lastID);
    if (!newJob) {
        console.error(`Failed to retrieve newly created job with ID ${result.lastID}. Company ID might be an issue: ${companyId}`);
        return NextResponse.json({ error: 'Failed to create job or retrieve it post-creation.' }, { status: 500 });
    }

    if (newJob && newJob.requiredSkills && typeof newJob.requiredSkills === 'string') {
        newJob.requiredSkills = JSON.parse(newJob.requiredSkills);
    } else if (newJob && !newJob.requiredSkills) {
        newJob.requiredSkills = [];
    }

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Failed to create job:', error);
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
        return NextResponse.json({ error: 'Invalid Company ID. Company does not exist.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
