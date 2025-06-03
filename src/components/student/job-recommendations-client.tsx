"use client";

import { recommendJobs, type RecommendJobsInput, type RecommendJobsOutput } from "@/ai/flows/recommend-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecommendedJobCard } from "./recommended-job-card";
import type { Job, Student, RecommendedJob as UIRecRecommendedJob } from "@/types";
import { useState, useEffect } from "react";
import { Loader2, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";


// Mock data (replace with actual data fetching)
const mockStudent: Student = {
  id: "student123",
  name: "Alex Johnson",
  email: "alex.j@example.com",
  gpa: 3.8,
  skills: ["React", "Node.js", "Python", "SQL"],
  // Simulating past applications by Job ID
  pastApplications: ["job003", "job005"] 
};

const mockJobs: Job[] = [
  { id: "job001", title: "Frontend Developer", companyId: "comp1", companyName: "WebWorks", description: "Develop modern web UIs.", requiredSkills: ["React", "TypeScript"], requiredGpa: 3.0, postedDate: "2024-01-15", status: "open" },
  { id: "job002", title: "Backend Developer", companyId: "comp2", companyName: "ServerSide Co", description: "Build robust backend systems.", requiredSkills: ["Node.js", "MongoDB"], requiredGpa: 3.2, postedDate: "2024-01-20", status: "open" },
  { id: "job003", title: "Data Scientist", companyId: "comp3", companyName: "Data Insights", description: "Analyze data and build models.", requiredSkills: ["Python", "R", "Machine Learning"], requiredGpa: 3.5, postedDate: "2024-02-01", status: "open" },
  { id: "job004", title: "Full Stack Engineer", companyId: "comp1", companyName: "WebWorks", description: "Work on both frontend and backend.", requiredSkills: ["React", "Node.js", "SQL"], requiredGpa: 3.3, postedDate: "2024-02-10", status: "open" },
  { id: "job005", title: "DevOps Engineer", companyId: "comp2", companyName: "ServerSide Co", description: "Manage infrastructure and deployments.", requiredSkills: ["AWS", "Docker", "Kubernetes"], requiredGpa: 3.0, postedDate: "2024-02-15", status: "open" },
  { id: "job006", title: "AI Specialist", companyId: "comp3", companyName: "Data Insights", description: "Research and implement AI solutions.", requiredSkills: ["Python", "TensorFlow", "NLP"], requiredGpa: 3.7, postedDate: "2024-03-01", status: "open" },
];


export function JobRecommendationsClient() {
  const [recommendations, setRecommendations] = useState<UIRecRecommendedJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [minGpa, setMinGpa] = useState<number | undefined>(undefined);
  const [loadingProgress, setLoadingProgress] = useState(0);


  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    setLoadingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const input: RecommendJobsInput = {
        studentSkills: mockStudent.skills || [],
        studentGPA: mockStudent.gpa || 0,
        pastApplications: mockStudent.pastApplications || [],
        allJobs: mockJobs.map(job => ({
          jobId: job.id,
          jobTitle: job.title,
          jobDescription: job.description,
          requiredSkills: job.requiredSkills || [],
          requiredGPA: job.requiredGpa || 0,
        })),
      };

      const result = await recommendJobs(input);
      
      // Map AI output to UI type, including denormalized fields
      const uiRecommendations = result.map(rec => {
        const jobDetails = mockJobs.find(j => j.id === rec.jobId);
        return {
          ...rec,
          jobTitle: jobDetails?.title,
          companyName: jobDetails?.companyName,
          description: jobDetails?.description,
        };
      });
      
      setRecommendations(uiRecommendations);
      toast({ title: "Recommendations Loaded", description: `Found ${uiRecommendations.length} tailored job recommendations.` });
    } catch (e) {
      console.error("Failed to get recommendations:", e);
      setError("Could not fetch recommendations. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to load job recommendations." });
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 500); // Allow progress bar to complete
    }
  };
  
  // Fetch recommendations on initial load
  useEffect(() => {
    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const filteredRecommendations = recommendations
    .filter(job => 
      (job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       job.companyName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (minGpa === undefined || (mockJobs.find(j => j.id === job.jobId)?.requiredGpa || 0) >= minGpa)
    );


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-accent" /> Filter Recommendations</CardTitle>
          <CardDescription>Refine your job search based on keywords or minimum GPA.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="searchTerm">Search (Title, Company)</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="searchTerm" 
                placeholder="e.g., Software Engineer, WebWorks" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="minGpa">Minimum Required GPA</Label>
            <Input 
              id="minGpa" 
              type="number" 
              step="0.1" 
              placeholder="e.g., 3.0"
              value={minGpa === undefined ? '' : minGpa}
              onChange={(e) => setMinGpa(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
           {/* Button is part of form for semantics, but filtering is client-side for now */}
          <Button onClick={fetchRecommendations} disabled={isLoading} className="md:col-span-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Refresh Recommendations
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-2">
          <Progress value={loadingProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">Fetching personalized recommendations...</p>
        </div>
      )}

      {error && <p className="text-destructive text-center">{error}</p>}

      {!isLoading && !error && filteredRecommendations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recommendations Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later. 
              Ensure your profile skills and GPA are up to date for best results.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredRecommendations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.map((rec) => (
            <RecommendedJobCard key={rec.jobId} job={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
