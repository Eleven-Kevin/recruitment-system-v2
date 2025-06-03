
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import type { Student, Company, Job, Application, Schedule } from '@/types';
import { pseudoHashPassword } from '@/lib/auth-utils';

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './campusconnect.db',
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function initializeDb() {
  const dbInstance = await getDb();

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      studentId TEXT UNIQUE,
      major TEXT,
      graduationYear INTEGER,
      gpa REAL,
      skills TEXT,
      preferences TEXT,
      resumeUrl TEXT,
      profilePictureUrl TEXT,
      companyId INTEGER, -- Added for company users
      FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      website TEXT,
      logoUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      companyId INTEGER NOT NULL,
      description TEXT NOT NULL,
      requiredSkills TEXT,
      requiredGpa REAL,
      location TEXT,
      postedDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE -- Cascade delete if company is removed
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      jobId INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied',
      appliedDate TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        jobId INTEGER,
        companyId INTEGER, -- Denormalized for easier lookup/filtering, or can be derived via jobId
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE SET NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL
    );
  `);

  await seedData(dbInstance);
}

async function seedData(dbInstance: Database) {
  const userCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM students');
  const userCount = userCountResult?.count || 0;

  // Seed Companies First if they don't exist
  const companyCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM companies');
  let companyCount = companyCountResult?.count || 0;
  let techSolutionsCompanyId: number | undefined;

  if (companyCount === 0) {
    const result = await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Tech Solutions Inc.", "Leading provider of innovative tech solutions.", "https://techsolutions.example.com", "https://placehold.co/100x100.png?text=TS"
    );
    techSolutionsCompanyId = result.lastID;
    await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Innovatech", "Pioneering future technologies.", "https://innovatech.example.com", "https://placehold.co/100x100.png?text=IT"
    );
    await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "WebWorks", "Crafting beautiful and functional web experiences.", "https://webworks.example.com", "https://placehold.co/100x100.png?text=WW"
    );
    await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "ServerSide Co", "Robust backend solutions for enterprise.", "https://serverside.example.com", "https://placehold.co/100x100.png?text=SS"
    );
    await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Data Insights", "Unlocking the power of data.", "https://datainsights.example.com", "https://placehold.co/100x100.png?text=DI"
    );
    companyCount = 5; // update count
  } else {
    const techSolutions = await dbInstance.get("SELECT id FROM companies WHERE name = 'Tech Solutions Inc.'");
    techSolutionsCompanyId = techSolutions?.id;
  }


  if (userCount === 0) {
    // Seed Admin User
    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Admin User", "admin@example.com", pseudoHashPassword("adminpassword"), "admin", "ADMIN001", "Platform Administration", null, null,
      JSON.stringify(["User Management", "System Configuration"]),
      "Oversees platform operations.",
      null, "https://placehold.co/150x150.png?text=AU"
    );

    // Seed Student Users
    const studentAlex = await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Alex Johnson", "alex.johnson@example.com", pseudoHashPassword("password123"), "student", "S1001", "Computer Science", 2025, 3.75,
      JSON.stringify(["JavaScript", "React", "Node.js", "Python"]),
      "Interested in full-stack development roles in tech companies. Open to remote work.",
      "https://example.com/resumes/alex_johnson.pdf", "https://placehold.co/150x150.png?text=AJ"
    );
     await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Alice Wonderland", "alice@example.com", pseudoHashPassword("password123"), "student", "S1002", "Computer Science", 2024, 3.9,
      JSON.stringify(["Java", "Spring Boot", "Microservices", "SQL", "Agile"]),
      "https://placehold.co/100x100.png?text=AW"
    );
    const studentBob = await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Bob The Builder", "bob@example.com", pseudoHashPassword("password123"), "student", "S1003", "Software Engineering", 2025, 3.5,
      JSON.stringify(["Python", "Django", "JavaScript", "React", "DevOps"]),
      "https://placehold.co/100x100.png?text=BB"
    );

    // Seed Company Representative User
    if (techSolutionsCompanyId) {
      await dbInstance.run(
        "INSERT INTO students (name, email, password, role, studentId, preferences, profilePictureUrl, companyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        "Company Rep", "company@example.com", pseudoHashPassword("companypassword"), "company", "COMPREP001",
        "Representing Tech Solutions Inc.", "https://placehold.co/150x150.png?text=CR", techSolutionsCompanyId
      );
    }


    // Seed College Staff User
    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, preferences, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      "College Staff", "college@example.com", pseudoHashPassword("collegepassword"), "college", "COLLSTAFF001",
      "Placement Office", "Manages college placement activities.", "https://placehold.co/150x150.png?text=CS"
    );
  }


  const jobCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM jobs');
  let jobCount = jobCountResult?.count || 0;
  let job1Id: number | undefined, job2Id: number | undefined;


  if (jobCount === 0) {
    const company1 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'WebWorks');
    const company2 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'ServerSide Co');
    const company3 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'Data Insights');
    const company4 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'Tech Solutions Inc.');


    if (company1) {
        const res1 = await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Frontend Developer", company1.id, "Develop modern web UIs.", JSON.stringify(["React", "TypeScript"]), 3.0, "Remote", new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
        job1Id = res1.lastID;
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Full Stack Engineer", company1.id, "Work on both frontend and backend.", JSON.stringify(["React", "Node.js", "SQL"]), 3.3, "New York, NY", new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
    }
     if (company2) {
        const res2 = await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Backend Developer", company2.id, "Build robust backend systems.", JSON.stringify(["Node.js", "MongoDB"]), 3.2, "San Francisco, CA", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
        job2Id = res2.lastID;
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "DevOps Engineer", company2.id, "Manage infrastructure and deployments.", JSON.stringify(["AWS", "Docker", "Kubernetes"]), 3.0, "Remote", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
    }
    if (company3) {
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Data Scientist", company3.id, "Analyze data and build models.", JSON.stringify(["Python", "R", "Machine Learning"]), 3.5, "Austin, TX", new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
         await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "AI Specialist", company3.id, "Research and implement AI solutions.", JSON.stringify(["Python", "TensorFlow", "NLP"]), 3.7, "Boston, MA", new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
    }
    if (company4) { // This is Tech Solutions Inc.
       await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Graduate Software Engineer", company4.id, "Join our dynamic team to build cutting-edge software solutions. Ideal for recent graduates.", JSON.stringify(["Java", "Spring Boot", "SQL"]), 3.2, "San Francisco, CA", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
    }
    jobCount = 6; // update count
  } else {
    // Get existing job IDs if seeding jobs is skipped, for applications seeding
    const jobOne = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Frontend Developer'");
    job1Id = jobOne?.id;
    const jobTwo = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Backend Developer'");
    job2Id = jobTwo?.id;
  }

  // Seed Applications
  const appCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM applications');
  const appCount = appCountResult?.count || 0;
  if (appCount === 0) {
    const studentAlex = await dbInstance.get('SELECT id FROM students WHERE email = ?', 'alex.johnson@example.com');
    const studentAlice = await dbInstance.get('SELECT id FROM students WHERE email = ?', 'alice@example.com');

    if (studentAlex && job1Id) {
      await dbInstance.run(
        "INSERT INTO applications (studentId, jobId, status, appliedDate) VALUES (?, ?, ?, ?)",
        studentAlex.id, job1Id, 'applied', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      );
    }
    if (studentAlice && job2Id) {
      await dbInstance.run(
        "INSERT INTO applications (studentId, jobId, status, appliedDate) VALUES (?, ?, ?, ?)",
        studentAlice.id, job2Id, 'shortlisted', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      );
    }
  }

  // Seed Schedules
  const scheduleCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM schedules');
  if ((scheduleCountResult?.count || 0) === 0) {
    const webworksCompany = await dbInstance.get("SELECT id FROM companies WHERE name = 'WebWorks'");
    const webworksJob = webworksCompany ? await dbInstance.get("SELECT id FROM jobs WHERE companyId = ? AND title = 'Frontend Developer'", webworksCompany.id) : null;

    if (webworksCompany && webworksJob) {
        await dbInstance.run(
            "INSERT INTO schedules (title, description, date, time, location, jobId, companyId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            "WebWorks Frontend Interviews",
            "First round interviews for Frontend Developer applicants.",
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            "10:00 AM - 02:00 PM",
            "Virtual via Google Meet",
            webworksJob.id,
            webworksCompany.id
        );
    }

    const techSolutionsCompany = await dbInstance.get("SELECT id FROM companies WHERE name = 'Tech Solutions Inc.'");
    if (techSolutionsCompany) {
         await dbInstance.run(
            "INSERT INTO schedules (title, description, date, time, location, companyId) VALUES (?, ?, ?, ?, ?, ?)",
            "Tech Solutions Campus Drive",
            "General campus recruitment drive for various roles.",
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            "09:00 AM - 05:00 PM",
            "Main College Auditorium",
            techSolutionsCompany.id
        );
    }
  }


  console.log("Database initialized and seeded if necessary (with pseudo-hashed passwords).");
}

initializeDb().catch(console.error);
