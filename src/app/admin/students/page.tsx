
"use client";
import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { AddStudentForm } from "@/components/admin/add-student-form";
import { useState } from "react";

export default function AdminStudentsPage() {
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);

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
              <AddStudentForm onSuccess={() => setIsAddStudentDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <DataTablePlaceholder 
        title="Student List" 
        icon={Users} 
        message="Student data will be displayed here. Use the 'Add Student' button to create new student profiles. Functionality to edit and delete students is planned." 
      />
    </>
  );
}
