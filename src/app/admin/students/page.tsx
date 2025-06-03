
import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";

export default function AdminStudentsPage() {
  return (
    <>
      <PageHeader
        title="Manage Students"
        description="View, edit, and manage student profiles and data."
        actions={
          <Button disabled className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Student (Future)
          </Button>
        }
      />
      <DataTablePlaceholder title="Student List" icon={Users} message="Student data will be displayed here. Functionality to add, edit, and delete students is planned." />
    </>
  );
}
