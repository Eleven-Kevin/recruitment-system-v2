
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Schedule } from '@/types'; // Assuming Schedule type is defined

// Get a specific schedule by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const scheduleId = parseInt(params.id, 10);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }

    const schedule: Schedule | undefined = await db.get(
      `SELECT 
         s.id, s.title, s.description, s.date, s.time, s.location, s.jobId, s.companyId,
         j.title as jobTitle, c.name as companyName
       FROM schedules s
       LEFT JOIN jobs j ON s.jobId = j.id
       LEFT JOIN companies c ON s.companyId = c.id OR j.companyId = c.id
       WHERE s.id = ?`,
      scheduleId
    );

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    return NextResponse.json(schedule);
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch schedule';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in GET /api/admin/schedules/${params.id}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Update a specific schedule by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const scheduleId = parseInt(params.id, 10);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }

    const body: Partial<Omit<Schedule, 'id' | 'jobTitle' | 'companyName'>> = await request.json();
    const { title, description, date, time, location, jobId, companyId } = body;

    // Basic validation (more can be added)
    if (!title || !date) {
      return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }

    const result = await db.run(
      'UPDATE schedules SET title = ?, description = ?, date = ?, time = ?, location = ?, jobId = ?, companyId = ? WHERE id = ?',
      title, description, date, time, location, jobId, companyId, scheduleId
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Schedule not found or no changes made' }, { status: 404 });
    }
    
    const updatedSchedule = await db.get(
      `SELECT 
         s.id, s.title, s.description, s.date, s.time, s.location, s.jobId, s.companyId,
         j.title as jobTitle, c.name as companyName
       FROM schedules s
       LEFT JOIN jobs j ON s.jobId = j.id
       LEFT JOIN companies c ON s.companyId = c.id OR j.companyId = c.id
       WHERE s.id = ?`,
      scheduleId);
    return NextResponse.json(updatedSchedule);
  } catch (e: unknown) {
    let errorMessage = 'Failed to update schedule';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in PUT /api/admin/schedules/${params.id}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete a specific schedule by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const scheduleId = parseInt(params.id, 10);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: 'Invalid schedule ID' }, { status: 400 });
    }

     const schedule = await db.get('SELECT id FROM schedules WHERE id = ?', scheduleId);
    if (!schedule) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const result = await db.run('DELETE FROM schedules WHERE id = ?', scheduleId);

    if (result.changes === 0) {
      console.warn(`Attempted to delete schedule ID ${scheduleId}, but no rows were affected, despite existence check passing.`);
      return NextResponse.json({ error: 'Schedule not found or delete failed unexpectedly' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Schedule deleted successfully' }, { status: 200 });
  } catch (e: unknown) {
    let errorMessage = 'Failed to delete schedule';
     if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error(`API Error in DELETE /api/admin/schedules/${params.id}:`, e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
