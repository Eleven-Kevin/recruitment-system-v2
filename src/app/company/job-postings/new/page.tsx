
import { PageHeader } from "@/components/core/page-header";
import { JobPostingForm } from "@/components/company/job-posting-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewJobPostingPage() {
  return (
    <>
      <PageHeader
        title="Create New Job Posting"
        description="Fill in the details below to post a new job opportunity for students."
      />
      <Card>
        <CardContent className="pt-6">
          <JobPostingForm />
        </CardContent>
      </Card>
    </>
  );
}
