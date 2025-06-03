import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { CalendarDays } from "lucide-react";

export default function AdminSchedulesPage() {
  return (
    <>
      <PageHeader
        title="Recruitment Schedules"
        description="Manage and oversee campus recruitment drives and interview schedules."
      />
      <DataTablePlaceholder title="Upcoming Schedules" icon={CalendarDays} message="Recruitment schedules and events will be managed here." />
    </>
  );
}
