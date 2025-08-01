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

  // Create tables if they don't exist
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
      gpa REAL, -- Scale 0-10
      skills TEXT,
      preferences TEXT,
      resumeUrl TEXT,
      profilePictureUrl TEXT,
      companyId INTEGER, -- For company users
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
      requiredGpa REAL, -- Scale 0-10
      location TEXT,
      postedDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
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
        companyId INTEGER,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE SET NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL
    );
  `);

  // Check and add companyId column to students table if it doesn't exist (simple migration)
  try {
    const studentsTableInfo = await dbInstance.all("PRAGMA table_info(students);");
    const companyIdColumnExists = studentsTableInfo.some(column => column.name === 'companyId');
    if (!companyIdColumnExists) {
      await dbInstance.exec('ALTER TABLE students ADD COLUMN companyId INTEGER REFERENCES companies(id) ON DELETE SET NULL;');
      console.log("Successfully added missing 'companyId' column to 'students' table.");
    }
  } catch (e) {
    console.error("Error checking/altering students table for companyId:", e);
  }


  await seedData(dbInstance);
}

async function seedData(dbInstance: Database) {
  const userCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM students');
  const userCount = userCountResult?.count || 0;

  const companyCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM companies');
  let companyCount = companyCountResult?.count || 0;
  let techSolutionsCompanyId: number | undefined;
  let innovatechCompanyId: number | undefined;
  let webworksCompanyId: number | undefined;
  let serversideCompanyId: number | undefined;
  let datainsightsCompanyId: number | undefined;


  if (companyCount === 0) {
    const resultTech = await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Tech Solutions Inc.", "Leading provider of innovative tech solutions.", "https://techsolutions.example.com", "https://placehold.co/100x100.png?text=TS"
    );
    techSolutionsCompanyId = resultTech.lastID;

    const resultInnovatech = await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Innovatech", "Pioneering future technologies.", "https://innovatech.example.com", "https://placehold.co/100x100.png?text=IT"
    );
    innovatechCompanyId = resultInnovatech.lastID;

    const resultWebworks = await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "WebWorks", "Crafting beautiful and functional web experiences.", "https://webworks.example.com", "https://placehold.co/100x100.png?text=WW"
    );
    webworksCompanyId = resultWebworks.lastID;

    const resultServerside = await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "ServerSide Co", "Robust backend solutions for enterprise.", "https://serverside.example.com", "https://placehold.co/100x100.png?text=SS"
    );
    serversideCompanyId = resultServerside.lastID;

    const resultDatainsights = await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Data Insights", "Unlocking the power of data.", "https://datainsights.example.com", "https://placehold.co/100x100.png?text=DI"
    );
    datainsightsCompanyId = resultDatainsights.lastID;

    companyCount = 5;
  } else {
    const techSolutions = await dbInstance.get("SELECT id FROM companies WHERE name = 'Tech Solutions Inc.'");
    techSolutionsCompanyId = techSolutions?.id;
    const innovatech = await dbInstance.get("SELECT id FROM companies WHERE name = 'Innovatech'");
    innovatechCompanyId = innovatech?.id;
    const webworks = await dbInstance.get("SELECT id FROM companies WHERE name = 'WebWorks'");
    webworksCompanyId = webworks?.id;
    const serverside = await dbInstance.get("SELECT id FROM companies WHERE name = 'ServerSide Co'");
    serversideCompanyId = serverside?.id;
    const datainsights = await dbInstance.get("SELECT id FROM companies WHERE name = 'Data Insights'");
    datainsightsCompanyId = datainsights?.id;
  }


  if (userCount === 0) {
    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Admin User", "admin@example.com", pseudoHashPassword("adminpassword"), "admin", "ADMIN001", "Platform Administration", null, null,
      JSON.stringify(["User Management", "System Configuration"]),
      "Oversees platform operations.",
      null, "https://placehold.co/150x150.png?text=AU"
    );

    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Alex Johnson", "alex.johnson@example.com", pseudoHashPassword("password123"), "student", "S1001", "Computer Science", 2025, 3.75 * 2.5, // 9.375
      JSON.stringify(["JavaScript", "React", "Node.js", "Python"]),
      "Interested in full-stack development roles in tech companies. Open to remote work.",
      "https://example.com/resumes/alex_johnson.pdf", "https://placehold.co/150x150.png?text=AJ"
    );
     await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Alice Wonderland", "alice@example.com", pseudoHashPassword("password123"), "student", "S1002", "Computer Science", 2024, 3.9 * 2.5, // 9.75
      JSON.stringify(["Java", "Spring Boot", "Microservices", "SQL", "Agile"]),
      "https://placehold.co/100x100.png?text=AW"
    );
    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Bob The Builder", "bob@example.com", pseudoHashPassword("password123"), "student", "S1003", "Software Engineering", 2025, 3.5 * 2.5, // 8.75
      JSON.stringify(["Python", "Django", "JavaScript", "React", "DevOps"]),
      "https://placehold.co/100x100.png?text=BB"
    );

    if (techSolutionsCompanyId) {
      await dbInstance.run(
        "INSERT INTO students (name, email, password, role, studentId, preferences, profilePictureUrl, companyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        "Company Rep TechSolutions", "company@example.com", pseudoHashPassword("companypassword"), "company", "COMPREP001",
        "Representing Tech Solutions Inc.", "https://placehold.co/150x150.png?text=CRTS", techSolutionsCompanyId
      );
    }
     if (innovatechCompanyId) {
      await dbInstance.run(
        "INSERT INTO students (name, email, password, role, studentId, preferences, profilePictureUrl, companyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        "Rep Innovatech", "rep.innovatech@example.com", pseudoHashPassword("companypassword"), "company", "COMPREP002",
        "Representing Innovatech.", "https://placehold.co/150x150.png?text=CRI", innovatechCompanyId
      );
    }


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
    if (webworksCompanyId) {
        const res1 = await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Frontend Developer", webworksCompanyId, "Develop modern web UIs.", JSON.stringify(["React", "TypeScript"]), 3.0 * 2.5, "Remote", new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), "open" // 7.5
        );
        job1Id = res1.lastID;
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Full Stack Engineer", webworksCompanyId, "Work on both frontend and backend.", JSON.stringify(["React", "Node.js", "SQL"]), 3.3 * 2.5, "New York, NY", new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), "open" // 8.25
        );
    }
     if (serversideCompanyId) {
        const res2 = await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Backend Developer", serversideCompanyId, "Build robust backend systems.", JSON.stringify(["Node.js", "MongoDB"]), 3.2 * 2.5, "San Francisco, CA", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), "open" // 8.0
        );
        job2Id = res2.lastID;
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "DevOps Engineer", serversideCompanyId, "Manage infrastructure and deployments.", JSON.stringify(["AWS", "Docker", "Kubernetes"]), 3.0 * 2.5, "Remote", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), "open" // 7.5
        );
    }
    if (datainsightsCompanyId) {
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Data Scientist", datainsightsCompanyId, "Analyze data and build models.", JSON.stringify(["Python", "R", "Machine Learning"]), 3.5 * 2.5, "Austin, TX", new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), "open" // 8.75
        );
         await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "AI Specialist", datainsightsCompanyId, "Research and implement AI solutions.", JSON.stringify(["Python", "TensorFlow", "NLP"]), 3.7 * 2.5, "Boston, MA", new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), "open" // 9.25
        );
    }
    if (techSolutionsCompanyId) {
       await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Graduate Software Engineer", techSolutionsCompanyId, "Join our dynamic team to build cutting-edge software solutions. Ideal for recent graduates.", JSON.stringify(["Java", "Spring Boot", "SQL"]), 3.2 * 2.5, "San Francisco, CA", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), "open" // 8.0
        );
    }
    jobCount = 7;
  } else {
    const jobOne = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Frontend Developer' AND companyId = (SELECT id FROM companies WHERE name = 'WebWorks')");
    job1Id = jobOne?.id;
    const jobTwo = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Backend Developer' AND companyId = (SELECT id FROM companies WHERE name = 'ServerSide Co')");
    job2Id = jobTwo?.id;
  }

  const appCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM applications');
  const appCount = appCountResult?.count || 0;
  if (appCount === 0) {
    const studentAlex = await dbInstance.get('SELECT id FROM students WHERE email = ?', 'alex.johnson@example.com');
    const studentAlice = await dbInstance.get('SELECT id FROM students WHERE email = ?', 'alice@example.com');
    const studentBob = await dbInstance.get('SELECT id FROM students WHERE email = ?', 'bob@example.com');
    // Get job IDs for different companies
    const jobFrontend = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Frontend Developer'");
    const jobBackend = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Backend Developer'");
    const jobDataScientist = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Data Scientist'");
    const jobGraduateSE = await dbInstance.get("SELECT id FROM jobs WHERE title = 'Graduate Software Engineer'");

    if (studentAlex && jobFrontend) {
      await dbInstance.run(
        "INSERT INTO applications (studentId, jobId, status, appliedDate) VALUES (?, ?, ?, ?)",
        studentAlex.id, jobFrontend.id, 'placed', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      );
    }
    if (studentAlice && jobBackend) {
      await dbInstance.run(
        "INSERT INTO applications (studentId, jobId, status, appliedDate) VALUES (?, ?, ?, ?)",
        studentAlice.id, jobBackend.id, 'placed', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      );
    }
    if (studentBob && jobDataScientist) {
      await dbInstance.run(
        "INSERT INTO applications (studentId, jobId, status, appliedDate) VALUES (?, ?, ?, ?)",
        studentBob.id, jobDataScientist.id, 'placed', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      );
    }
    // Existing sample applications
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

  const scheduleCountResult = await dbInstance.get('SELECT COUNT(*) as count FROM schedules');
  if ((scheduleCountResult?.count || 0) === 0) {
    if (webworksCompanyId && job1Id) { // job1Id is Frontend Developer from WebWorks
        await dbInstance.run(
            "INSERT INTO schedules (title, description, date, time, location, jobId, companyId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            "WebWorks Frontend Interviews",
            "First round interviews for Frontend Developer applicants.",
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            "10:00 AM - 02:00 PM",
            "Virtual via Google Meet",
            job1Id,
            webworksCompanyId
        );
        // Add another mock interview for WebWorks
        await dbInstance.run(
            "INSERT INTO schedules (title, description, date, time, location, jobId, companyId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            "WebWorks Final Interviews",
            "Final round interviews for selected candidates.",
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            "03:00 PM - 05:00 PM",
            "WebWorks HQ, Conference Room 2",
            job1Id,
            webworksCompanyId
        );
    }

    if (techSolutionsCompanyId) {
         await dbInstance.run(
            "INSERT INTO schedules (title, description, date, time, location, companyId) VALUES (?, ?, ?, ?, ?, ?)",
            "Tech Solutions Campus Drive",
            "General campus recruitment drive for various roles.",
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            "09:00 AM - 05:00 PM",
            "Main College Auditorium",
            techSolutionsCompanyId
        );
        // Add another mock interview for Tech Solutions
        await dbInstance.run(
            "INSERT INTO schedules (title, description, date, time, location, companyId) VALUES (?, ?, ?, ?, ?, ?)",
            "Tech Solutions Final Interviews",
            "Final interviews for shortlisted candidates.",
            new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            "11:00 AM - 01:00 PM",
            "Tech Solutions HQ, Room 101",
            techSolutionsCompanyId
        );
    }
  }


  console.log("Database initialized and seeded if necessary (with pseudo-hashed passwords). GPA scale 0-10.");
}

initializeDb().catch(error => {
  console.error("Failed to initialize database:", error);
  // Potentially exit or handle critical failure if DB init is essential at startup
});