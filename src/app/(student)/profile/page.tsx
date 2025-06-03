import { PageHeader } from "@/components/core/page-header";
import { StudentProfileForm } from "@/components/student/profile-form";
import type { Student } from "@/types";

// Mock student data for pre-filling the form.
// In a real app, this would be fetched from a database.
const mockStudent: Student = {
  id: "student123",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  studentId: "S1001",
  major: "Computer Science",
  graduationYear: 2025,
  gpa: 3.75,
  skills: ["JavaScript", "React", "Node.js", "Python"],
  preferences: "Interested in full-stack development roles in tech companies. Open to remote work.",
  resumeUrl: "https://example.com/resumes/alex_johnson.pdf",
  profilePictureUrl: "https://placehold.co/150x150.png?text=AJ"
};

export default function StudentProfilePage() {
  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your academic details, skills, and career preferences."
      />
      <StudentProfileForm student={mockStudent} />
    </>
  );
}
