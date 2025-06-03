import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Briefcase } from "lucide-react";

export default function AdminJobsPage() {
  return (
    <>
      <PageHeader
        title="Manage Job Postings"
        description="Review, approve, and manage all job postings on the platform."
      />
      <DataTablePlaceholder title="Job Postings Overview" icon={Briefcase} message="All job postings will be displayed here with moderation tools." />
    </>
  );
}
