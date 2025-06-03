
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Schedule } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const schedules: Schedule[] = await db.all(
      `SELECT 
         s.id, s.title, s.description, s.date, s.time, s.location, s.jobId, s.companyId,
         j.title as jobTitle, 
         COALESCE(c_job.name, c_direct.name) as companyName
       FROM schedules s
       LEFT JOIN jobs j ON s.jobId = j.id
       LEFT JOIN companies c_job ON j.companyId = c_job.id
       LEFT JOIN companies c_direct ON s.companyId = c_direct.id
       ORDER BY s.date DESC, s.time ASC`
    );
    return NextResponse.json(schedules);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch schedules';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in GET /api/admin/schedules:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { title, description, date, time, location, jobId, companyId: directCompanyId } = body as Partial<Omit<Schedule, 'id' | 'companyName' | 'jobTitle'>>;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }
    
    let finalCompanyId = directCompanyId;
    if (jobId) {
        const job = await db.get('SELECT companyId FROM jobs WHERE id = ?', jobId);
        if (job && job.companyId) {
            finalCompanyId = job.companyId;
        } else if (jobId && !directCompanyId) {
             console.warn(`Job with ID ${jobId} found, but it has no companyId, or job not found. Schedule companyId might be null.`);
        }
    }

    const result = await db.run(
      'INSERT INTO schedules (title, description, date, time, location, jobId, companyId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      title, description, date, time, location, jobId, finalCompanyId
    );

    if (!result.lastID) {
      return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }

    const newSchedule = await db.get(
      `SELECT 
         s.id, s.title, s.description, s.date, s.time, s.location, s.jobId, s.companyId,
         j.title as jobTitle, 
         COALESCE(c_job.name, c_direct.name) as companyName
       FROM schedules s
       LEFT JOIN jobs j ON s.jobId = j.id
       LEFT JOIN companies c_job ON j.companyId = c_job.id
       LEFT JOIN companies c_direct ON s.companyId = c_direct.id
       WHERE s.id = ?`, result.lastID
    );
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (e: unknown) {
    let errorMessage = 'Failed to create schedule';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in POST /api/admin/schedules:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
