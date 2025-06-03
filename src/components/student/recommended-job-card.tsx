
import type { RecommendedJob } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, ExternalLink, Percent } from "lucide-react";
import Link from "next/link";

interface RecommendedJobCardProps {
  job: RecommendedJob; // jobId is now number
}

export function RecommendedJobCard({ job }: RecommendedJobCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-headline">{job.jobTitle || `Job ID: ${job.jobId}`}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Percent className="h-3 w-3" /> 
            {`${Math.round(job.relevanceScore * 100)}% Match`}
          </Badge>
        </div>
        {job.companyName && (
          <CardDescription className="flex items-center gap-1 pt-1">
            <Building className="h-4 w-4" /> {job.companyName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description || "No description available. Click to learn more."}
        </p>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group">
          {/* In a real app, this link would go to the job details page for the specific job */}
          {/* For now, this link might be a placeholder or link to a generic job details area if one exists */}
          <Link href={`/student/job-details/${job.jobId}`}> {/* Updated placeholder link */}
            View Details <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
