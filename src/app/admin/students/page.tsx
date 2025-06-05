"use client";
import { PageHeader } from "@/components/core/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddStudentForm } from "@/components/admin/add-student-form";
import { useState, useEffect } from "react";
import type { Student } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function AdminStudentsPage() {
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStudents() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/students"); // Ensure this fetches students
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStudent(studentId: number) {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(\`/api/students/\${studentId}\`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete student");
      }
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete student.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <>
      <PageHeader
        title="Manage Students"
        description="View, edit, and manage student profiles and data."
        actions={
          <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new student account. The student will be able to log in with the email and password provided.
                </DialogDescription>
              </DialogHeader>
              <AddStudentForm onSuccess={() => {
                setIsAddStudentDialogOpen(false);
                fetchStudents(); // Refresh list after adding
              }} />
            </DialogContent>
          </Dialog>
        }
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-2 text-muted-foreground">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
         <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Students Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new student.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card text-card-foreground shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Student ID</TableHead>
                <TableHead className="min-w-[150px]">Major</TableHead>
                <TableHead className="min-w-[80px]">GPA (0-10)</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">{student.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{student.email}</TableCell>
                  <TableCell className="max-w-[100px] truncate">{student.studentId || "N/A"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{student.major || "N/A"}</TableCell>
                  <TableCell>{student.gpa?.toFixed(1) || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    {/* Future: Edit button */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}