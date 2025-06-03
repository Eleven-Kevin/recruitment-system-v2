
import { PageHeader } from "@/components/core/page-header";
import { JobPostingForm } from "@/components/company/job-posting-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Company } from "@/types";

async function getCompanies(): Promise<Company[]> {
  // This is a simplified fetch, in a real app you might have a dedicated API for companies
  // For now, let's assume we don't have a /api/companies yet and use a placeholder or try to fetch existing ones
  // from the job-recommendations-client mock data for simplicity if needed, or fetch from a new companies API.
  // Let's create a very basic /api/companies route.

  // For initial setup, since we don't have /api/companies yet, we will make it fetch from /api/jobs and extract unique companies
  // This is a temporary workaround. A proper /api/companies should be made.
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs`, { cache: 'no-store' });
  if (!res.ok) {
    console.error("Failed to fetch jobs to derive companies", res.status, await res.text());
    // Fallback: create a placeholder company if fetching fails, so the form is usable.
    return [{ id: 1, name: "Default Company (Error fetching)" }]; 
  }
  const jobs = await res.json();
  const companiesMap = new Map<number, Company>();
  jobs.forEach((job: { companyId: number, companyName: string }) => {
    if (!companiesMap.has(job.companyId)) {
      companiesMap.set(job.companyId, { id: job.companyId, name: job.companyName });
    }
  });
  const uniqueCompanies = Array.from(companiesMap.values());
  if(uniqueCompanies.length === 0) {
    // If still no companies (e.g. no jobs seeded yet), provide a default
    return [{ id: 1, name: "Default Company (Seed DB)" }];
  }
  return uniqueCompanies;
}


export default async function NewJobPostingPage() {
  const companies = await getCompanies();

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
