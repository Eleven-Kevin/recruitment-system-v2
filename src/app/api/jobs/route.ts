
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Job } from '@/types';

// Get all jobs
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    // Join with companies to get companyName
    const jobs: Job[] = await db.all(`
      SELECT 
        j.id, j.title, j.companyId, c.name as companyName, j.description, 
        j.requiredSkills, j.requiredGpa, j.location, j.postedDate, j.status 
      FROM jobs j
      JOIN companies c ON j.companyId = c.id
      ORDER BY j.postedDate DESC
    `);

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
    const body: Omit<Job, 'id' | 'postedDate' | 'status' | 'companyName'> & {companyId: number} = await request.json(); // Ensure companyId is passed
    
    const { title, companyId, description, requiredSkills, requiredGpa, location } = body;

    if (!title || !companyId || !description) {
      return NextResponse.json({ error: 'Title, Company ID, and Description are required' }, { status: 400 });
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
    if (newJob && newJob.requiredSkills && typeof newJob.requiredSkills === 'string') {
        newJob.requiredSkills = JSON.parse(newJob.requiredSkills);
    } else if (newJob && !newJob.requiredSkills) {
        newJob.requiredSkills = [];
    }

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Failed to create job:', error);
    // Check for specific SQLite errors, e.g., foreign key constraint
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
        return NextResponse.json({ error: 'Invalid Company ID. Company does not exist.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
