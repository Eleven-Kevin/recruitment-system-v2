import { PageHeader } from "@/components/core/page-header";
import { DataTablePlaceholder } from "@/components/core/data-table-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building } from "lucide-react";

export default function AdminCompaniesPage() {
  return (
    <>
      <PageHeader
        title="Manage Companies"
        description="Oversee company listings, verify accounts, and manage partnerships."
        actions={
          <Button disabled className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Company (Future)
          </Button>
        }
      />
      <DataTablePlaceholder title="Company List" icon={Building} message="Registered companies will be listed here with management options." />
    </>
  );
}
