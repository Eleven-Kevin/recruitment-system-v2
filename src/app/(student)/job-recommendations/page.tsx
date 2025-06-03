import { PageHeader } from "@/components/core/page-header";
import { JobRecommendationsClient } from "@/components/student/job-recommendations-client";

export default function JobRecommendationsPage() {
  return (
    <>
      <PageHeader
        title="AI Job Recommendations"
        description="Discover job opportunities tailored to your skills, GPA, and application history. Our AI helps you find the best fit."
      />
      <JobRecommendationsClient />
    </>
  );
}
