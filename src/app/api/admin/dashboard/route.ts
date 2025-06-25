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

    // Branch-wise placement stats
    const branchPlacementStats = await db.all(`
      SELECT s.major as branch,
        COUNT(s.id) as totalStudents,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM applications a WHERE a.studentId = s.id AND a.status = 'placed'
        ) THEN 1 ELSE 0 END) as placedStudents
      FROM students s
      WHERE s.role = 'student'
      GROUP BY s.major
      ORDER BY s.major
    `);
    branchPlacementStats.forEach(b => {
      b.placementPercentage = b.totalStudents > 0 ? Math.round((b.placedStudents / b.totalStudents) * 100) : 0;
    });

    // Top recruiting companies
    const topRecruitingCompanies = await db.all(`
      SELECT c.name as companyName, COUNT(DISTINCT a.studentId) as placedCount
      FROM applications a
      JOIN jobs j ON a.jobId = j.id
      JOIN companies c ON j.companyId = c.id
      WHERE a.status = 'placed'
      GROUP BY c.id
      ORDER BY placedCount DESC, c.name ASC
      LIMIT 5
    `);

    return NextResponse.json({
      totalStudents,
      totalCompanies,
      totalActiveJobPostings,
      totalPlacedStudents,
      branchPlacementStats,
      topRecruitingCompanies
    });
  } catch (e: unknown) {
    let errorMessage = 'Failed to fetch dashboard data';
    if (e instanceof Error) {
        errorMessage = e.message;
    } else if (typeof e === 'string') {
        errorMessage = e;
    }
    console.error('API Error in GET /api/admin/dashboard:', e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
