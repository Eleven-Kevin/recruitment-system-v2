
import { PageHeader } from "@/components/core/page-header";
import { ResumeRankerClient } from "@/components/admin/resume-ranker-client";

export default function ResumeRankingPage() {
  return (
    <>
      <PageHeader
        title="AI Resume Ranking Tool"
        description="Rank student resumes based on their relevance to a specific job description using AI-powered skills matching."
      />
      <ResumeRankerClient />
    </>
  );
}
