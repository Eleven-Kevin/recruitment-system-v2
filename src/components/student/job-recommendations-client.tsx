
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

async function fetchStudentData(studentId: number): Promise<Student | null> {
  try {
    const res = await fetch(`/api/students/${studentId}`);
    if (!res.ok) {
      console.error("Failed to fetch student data:", res.status);
      return null;
    }
    const student: Student = await res.json();
     // Ensure skills is an array
    if (student && typeof student.skills === 'string') {
      student.skills = JSON.parse(student.skills);
    } else if (student && !student.skills) {
      student.skills = [];
    }
    return student;
  } catch (error) {
    console.error("Error fetching student data:", error);
    return null;
  }
}

async function fetchAllJobs(): Promise<Job[]> {
  try {
    const res = await fetch('/api/jobs');
    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.status);
      return [];
    }
    const jobs: Job[] = await res.json();
    // Ensure skills is an array for each job
    return jobs.map(job => ({
      ...job,
      requiredSkills: job.requiredSkills && Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
    }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}


export function JobRecommendationsClient() {
  const [student, setStudent] = useState<Student | null>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<UIRecRecommendedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading true for initial data fetch
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [minGpaFilter, setMinGpaFilter] = useState<number | undefined>(undefined); // Changed name to avoid conflict
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(10); // Initial data load progress
      // For demo, using student ID 1. In real app, get from session.
      const fetchedStudent = await fetchStudentData(1); 
      setLoadingProgress(40);
      const fetchedJobs = await fetchAllJobs();
      setLoadingProgress(70);

      if (fetchedStudent) setStudent(fetchedStudent);
      else setError("Failed to load student profile for recommendations.");
      
      setAllJobs(fetchedJobs);
      if (fetchedJobs.length === 0 && !error) setError("No jobs available to recommend from.");
      
      setLoadingProgress(100);
      setIsLoading(false);

      if (fetchedStudent && fetchedJobs.length > 0) {
        // Automatically fetch recommendations once data is loaded
        await generateRecommendations(fetchedStudent, fetchedJobs);
      }
    }
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const generateRecommendations = async (currentStudent?: Student | null, currentJobs?: Job[] | null) => {
    const stud = currentStudent || student;
    const jobs = currentJobs || allJobs;

    if (!stud || jobs.length === 0) {
      toast({ variant: "destructive", title: "Cannot Generate", description: "Student data or job list is missing." });
      setError(stud ? "No jobs available for recommendations." : "Student profile not loaded.");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRecommendations([]);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const input: RecommendJobsInput = {
        studentSkills: stud.skills || [],
        studentGPA: stud.gpa || 0,
        // Assuming student.pastApplications is not yet available from DB, pass empty or fetch if implemented
        pastApplications: (stud as any).pastApplications || [], 
        allJobs: jobs.map(job => ({
          jobId: job.id.toString(), // Genkit flow expects string jobId
          jobTitle: job.title,
          jobDescription: job.description,
          requiredSkills: job.requiredSkills || [],
          requiredGPA: job.requiredGpa || 0,
        })),
      };

      const result = await recommendJobs(input);
      
      const uiRecommendations = result.map(rec => {
        const jobDetails = jobs.find(j => j.id.toString() === rec.jobId);
        return {
          ...rec,
          jobId: parseInt(rec.jobId, 10), // Convert back to number for UI type
          jobTitle: jobDetails?.title,
          companyName: jobDetails?.companyName,
          description: jobDetails?.description,
        };
      });
      
      setRecommendations(uiRecommendations);
      toast({ title: "Recommendations Generated", description: `Found ${uiRecommendations.length} tailored job recommendations.` });
    } catch (e) {
      console.error("Failed to get recommendations:", e);
      setError("Could not generate recommendations. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to generate job recommendations." });
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const filteredRecommendations = recommendations
    .filter(jobRec => {
      const jobDetails = allJobs.find(j => j.id === jobRec.jobId);
      return (jobRec.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              jobRec.companyName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (minGpaFilter === undefined || (jobDetails?.requiredGpa || 0) >= minGpaFilter);
    });

  if (isLoading) {
    return (
      <div className="space-y-2 pt-4 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
        <p className="text-muted-foreground">Loading initial data...</p>
        <Progress value={loadingProgress} className="w-1/2 mx-auto" />
      </div>
    );
  }

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
            <Label htmlFor="minGpaFilter">Minimum Required GPA</Label>
            <Input 
              id="minGpaFilter" 
              type="number" 
              step="0.1" 
              placeholder="e.g., 3.0"
              value={minGpaFilter === undefined ? '' : minGpaFilter}
              onChange={(e) => setMinGpaFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
          <Button onClick={() => generateRecommendations()} disabled={isGenerating || !student || allJobs.length === 0} className="md:col-span-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generating..." : "Refresh Recommendations"}
          </Button>
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="space-y-2">
          <Progress value={loadingProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">AI is processing recommendations...</p>
        </div>
      )}

      {error && <p className="text-destructive text-center py-4">{error}</p>}

      {!isGenerating && !error && filteredRecommendations.length === 0 && recommendations.length > 0 && (
         <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Matching Recommendations</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      )}
      
      {!isGenerating && !error && recommendations.length === 0 && !isLoading && (
         <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recommendations Generated Yet</h3>
            <p className="text-muted-foreground">
              Click "Refresh Recommendations" to get started. Ensure your profile skills and GPA are up to date for best results.
            </p>
          </CardContent>
        </Card>
      )}


      {!isLoading && !isGenerating && filteredRecommendations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.map((rec) => (
            <RecommendedJobCard key={rec.jobId} job={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
