
"use client";

import { recommendJobs, type RecommendJobsInput } from "@/ai/flows/recommend-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecommendedJobCard } from "./recommended-job-card";
import type { Job, Student, RecommendedJob as UIRecRecommendedJob, Application } from "@/types";
import { useState, useEffect } from "react";
import { Loader2, Filter, Search as SearchIcon } from "lucide-react"; // Renamed Search to SearchIcon
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

async function fetchStudentDataById(studentId: string | number): Promise<Student | null> {
  try {
    const res = await fetch(`/api/students/${studentId}`);
    if (!res.ok) {
      console.error("Failed to fetch student data:", res.status);
      return null;
    }
    const student: Student = await res.json();
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

async function fetchStudentApplications(studentId: string | number): Promise<Application[]> {
  try {
    const res = await fetch(`/api/students/${studentId}/applications`);
    if (!res.ok) {
      console.error("Failed to fetch student applications:", res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching student applications:", error);
    return [];
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
  const [studentApplications, setStudentApplications] = useState<Application[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<UIRecRecommendedJob[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [minGpaFilter, setMinGpaFilter] = useState<number | undefined>(undefined);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingInitial(true);
      setError(null);
      setLoadingProgress(10);

      let fetchedStudent: Student | null = null;
      let fetchedApplications: Application[] = [];

      if (typeof window !== 'undefined') {
          const studentId = localStorage.getItem('userId');
          if (studentId) {
            fetchedStudent = await fetchStudentDataById(studentId);
            setLoadingProgress(30);
            if (fetchedStudent) {
              fetchedApplications = await fetchStudentApplications(studentId);
            }
          } else {
            setError("Please log in to get job recommendations.");
          }
      }
      setLoadingProgress(50);
      const fetchedJobs = await fetchAllJobs();
      setLoadingProgress(70);

      if (fetchedStudent) setStudent(fetchedStudent);
      else if (!error) setError("Failed to load student profile for recommendations.");
      
      setStudentApplications(fetchedApplications);
      setAllJobs(fetchedJobs);
      if (fetchedJobs.length === 0 && !error) setError("No jobs available to recommend from.");
      
      setLoadingProgress(100);
      setIsLoadingInitial(false);

      if (fetchedStudent && fetchedJobs.length > 0) {
        await generateRecommendations(fetchedStudent, fetchedJobs, fetchedApplications);
      }
    }
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const generateRecommendations = async (
    currentStudentParam?: Student | null, 
    currentJobsParam?: Job[] | null,
    currentAppsParam?: Application[] | null
  ) => {
    const studToUse = currentStudentParam || student;
    const jobsToUse = currentJobsParam || allJobs;
    const appsToUse = currentAppsParam || studentApplications;

    if (!studToUse) {
        setError("Student profile not loaded. Please log in.");
        setIsGenerating(false);
        return;
    }
    if (jobsToUse.length === 0) {
        setError("No jobs available for recommendations.");
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
        studentSkills: studToUse.skills || [],
        studentGPA: studToUse.gpa || 0, // GPA on 0-10 scale
        pastApplications: appsToUse.map(app => app.jobId.toString()), 
        allJobs: jobsToUse.map(job => ({
          jobId: job.id.toString(), 
          jobTitle: job.title,
          jobDescription: job.description,
          requiredSkills: job.requiredSkills || [],
          requiredGPA: job.requiredGpa || 0, // GPA on 0-10 scale
        })),
      };

      const result = await recommendJobs(input);
      
      const uiRecommendations = result.map(rec => {
        const jobDetails = jobsToUse.find(j => j.id.toString() === rec.jobId);
        return {
          ...rec,
          jobId: parseInt(rec.jobId, 10), 
          jobTitle: jobDetails?.title,
          companyName: jobDetails?.companyName,
          description: jobDetails?.description,
          location: jobDetails?.location,
          postedDate: jobDetails?.postedDate,
          requiredGpa: jobDetails?.requiredGpa, // Include requiredGpa for display
        };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore); 
      
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
      return (jobRec.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              jobRec.companyName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (minGpaFilter === undefined || (jobRec?.requiredGpa || 0) >= minGpaFilter);
    });

  if (isLoadingInitial) {
    return (
      <div className="space-y-2 pt-4 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
        <p className="text-muted-foreground">Loading initial data and recommendations...</p>
        <Progress value={loadingProgress} className="w-1/2 mx-auto" />
      </div>
    );
  }
  
  if (error && !isGenerating) { 
    return <p className="text-destructive text-center py-4">{error}</p>;
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-accent" /> Filter Recommendations</CardTitle>
          <CardDescription>Refine your job search based on keywords or minimum required GPA (0-10 scale).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="searchTerm">Search (Title, Company)</Label>
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
            <Label htmlFor="minGpaFilter">Min. Required GPA (0-10)</Label>
            <Input 
              id="minGpaFilter" 
              type="number" 
              step="0.1" 
              min="0"
              max="10"
              placeholder="e.g., 7.5"
              value={minGpaFilter === undefined ? '' : minGpaFilter}
              onChange={(e) => setMinGpaFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
          <Button onClick={() => generateRecommendations()} disabled={isGenerating || !student || allJobs.length === 0} className="md:col-span-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2 h-4 w-4" />}
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

      {error && isGenerating && <p className="text-destructive text-center py-4">{error}</p>}


      {!isGenerating && !error && filteredRecommendations.length === 0 && recommendations.length > 0 && (
         <Card className="text-center py-12">
          <CardContent>
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Matching Recommendations</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or click "Refresh Recommendations".
            </p>
          </CardContent>
        </Card>
      )}
      
      {!isGenerating && !error && recommendations.length === 0 && !isLoadingInitial && (
         <Card className="text-center py-12">
          <CardContent>
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recommendations Generated Yet</h3>
            <p className="text-muted-foreground">
              Click "Refresh Recommendations" to get started. Ensure your profile skills and GPA (0-10 scale) are up to date for best results.
            </p>
          </CardContent>
        </Card>
      )}


      {!isLoadingInitial && !isGenerating && filteredRecommendations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.map((rec) => (
            <RecommendedJobCard key={rec.jobId} job={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

