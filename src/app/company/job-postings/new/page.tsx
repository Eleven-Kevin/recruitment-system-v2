
import { PageHeader } from "@/components/core/page-header";
import { JobPostingForm } from "@/components/company/job-posting-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Company } from "@/types";

// Fetches all companies, useful if an admin is creating a job for any company
// Or if a company user needs to select (though ideally their companyId is implicit)
async function getAllCompanies(): Promise<Company[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/companies`, { cache: 'no-store' });
  if (!res.ok) {
    console.error("Failed to fetch companies", res.status, await res.text());
    // Fallback: create a placeholder company if fetching fails, so the form is usable.
    return [{ id: 0, name: "Error: Could not load companies" }]; 
  }
  const companies = await res.json();
  if (!companies || companies.length === 0) {
    return [{ id: 0, name: "No companies found (Seed DB)" }];
  }
  return companies;
}


export default async function NewJobPostingPage() {
  // For a company user, their companyId would ideally be passed down or fetched separately
  // and pre-selected/fixed in the form.
  // For an admin, they might need to select from all companies.
  const companies = await getAllCompanies();

  return (
    <>
      <PageHeader
        title="Create New Job Posting"
        description="Fill in the details below to post a new job opportunity for students."
      />
      <Card>
        <CardContent className="pt-6">
          <JobPostingForm companies={companies} />
        </CardContent>
      </Card>
    </>
  );
}
