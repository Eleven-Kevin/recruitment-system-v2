import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Users } from "lucide-react";

export default function CollegeBranchStudentsPage({ params }: { params: { branch: string } }) {
  const branchName = params.branch === 'all' ? 'All Students' : decodeURIComponent(params.branch).replace(/-/g, ' ');
  return (
    <>
      <PageHeader
        title={`Student Details: ${branchName}`}
        description={`View academic information and placement status for students in the ${branchName} ${params.branch !== 'all' ? 'branch' : ''}.`}
      />
      {/* TODO: Add filters for year, placement status etc. */}
      <DataTablePlaceholder title={`${branchName} List`} icon={Users} message={`Student data for ${branchName} will be shown here. Use filters to refine the list.`} />
    </>
  );
}
