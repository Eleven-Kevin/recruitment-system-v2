
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import type { Student, Company, Job, Application } from '@/types';

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
      password TEXT, -- Added for login, SHOULD BE HASHED IN PRODUCTION
      role TEXT NOT NULL DEFAULT 'student', -- Added for user roles
      studentId TEXT UNIQUE,
      major TEXT,
      graduationYear INTEGER,
      gpa REAL,
      skills TEXT, -- JSON string for array
      preferences TEXT,
      resumeUrl TEXT,
      profilePictureUrl TEXT
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
      requiredSkills TEXT, -- JSON string for array
      requiredGpa REAL,
      location TEXT,
      postedDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open', -- 'open' or 'closed'
      FOREIGN KEY (companyId) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      jobId INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied', -- 'applied', 'shortlisted', 'interviewing', 'offered', 'rejected', 'accepted'
      appliedDate TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id),
      FOREIGN KEY (jobId) REFERENCES jobs(id)
    );
  `);

  // Seed data if tables are empty
  await seedData(dbInstance);
}

async function seedData(dbInstance: Database) {
  const studentCount = await dbInstance.get('SELECT COUNT(*) as count FROM students');
  if (studentCount && studentCount.count === 0) {
    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, preferences, resumeUrl, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Alex Johnson", "alex.johnson@example.com", "password123", "student", "S1001", "Computer Science", 2025, 3.75,
      JSON.stringify(["JavaScript", "React", "Node.js", "Python"]),
      "Interested in full-stack development roles in tech companies. Open to remote work.",
      "https://example.com/resumes/alex_johnson.pdf", "https://placehold.co/150x150.png?text=AJ"
    );
     await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Alice Wonderland", "alice@example.com", "password123", "student", "S1002", "Computer Science", 2024, 3.9,
      JSON.stringify(["Java", "Spring Boot", "Microservices", "SQL", "Agile"]),
      "https://placehold.co/100x100.png?text=AW"
    );
    await dbInstance.run(
      "INSERT INTO students (name, email, password, role, studentId, major, graduationYear, gpa, skills, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      "Bob The Builder", "bob@example.com", "password123", "student", "S1003", "Software Engineering", 2025, 3.5,
      JSON.stringify(["Python", "Django", "JavaScript", "React", "DevOps"]),
      "https://placehold.co/100x100.png?text=BB"
    );
  }

  const companyCount = await dbInstance.get('SELECT COUNT(*) as count FROM companies');
  if (companyCount && companyCount.count === 0) {
    await dbInstance.run(
      "INSERT INTO companies (name, description, website, logoUrl) VALUES (?, ?, ?, ?)",
      "Tech Solutions Inc.", "Leading provider of innovative tech solutions.", "https://techsolutions.example.com", "https://placehold.co/100x100.png?text=TS"
    );
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
  }

  const jobCount = await dbInstance.get('SELECT COUNT(*) as count FROM jobs');
  if (jobCount && jobCount.count === 0) {
    const company1 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'WebWorks');
    const company2 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'ServerSide Co');
    const company3 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'Data Insights');
    const company4 = await dbInstance.get('SELECT id FROM companies WHERE name = ?', 'Tech Solutions Inc.');


    if (company1) {
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Frontend Developer", company1.id, "Develop modern web UIs.", JSON.stringify(["React", "TypeScript"]), 3.0, "Remote", new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Full Stack Engineer", company1.id, "Work on both frontend and backend.", JSON.stringify(["React", "Node.js", "SQL"]), 3.3, "New York, NY", new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
    }
     if (company2) {
        await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Backend Developer", company2.id, "Build robust backend systems.", JSON.stringify(["Node.js", "MongoDB"]), 3.2, "San Francisco, CA", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
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
    if (company4) {
       await dbInstance.run(
          "INSERT INTO jobs (title, companyId, description, requiredSkills, requiredGpa, location, postedDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          "Graduate Software Engineer", company4.id, "Join our dynamic team to build cutting-edge software solutions. Ideal for recent graduates.", JSON.stringify(["Java", "Spring Boot", "SQL"]), 3.2, "San Francisco, CA", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), "open"
        );
    }
  }
  console.log("Database initialized and seeded if necessary.");
}

// Call initializeDb on module load (or call it from a global setup file)
initializeDb().catch(console.error);
