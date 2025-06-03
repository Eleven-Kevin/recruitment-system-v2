import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';



export async function GET() {
  try {
    const db = await getDb();

    const studentCountResult = await db.get('SELECT COUNT(*) as count FROM students WHERE role = ?', 'student');
    const totalStudents = studentCountResult?.count || 0;

    const companyCountResult = await db.get('SELECT COUNT(*) as count FROM companies');
    const totalCompanies = companyCountResult?.count || 0;

    const activeJobCountResult = await db.get('SELECT COUNT(*) as count FROM jobs WHERE status = ?', 'open');
    const totalActiveJobPostings = activeJobCountResult?.count || 0;

    const placedStudentCountResult = await db.get('SELECT COUNT(DISTINCT studentId) as count FROM applications WHERE status = ?', 'placed');
    const totalPlacedStudents = placedStudentCountResult?.count || 0;

    return NextResponse.json({
      totalStudents,
      totalCompanies,
      totalActiveJobPostings,
      totalPlacedStudents,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}