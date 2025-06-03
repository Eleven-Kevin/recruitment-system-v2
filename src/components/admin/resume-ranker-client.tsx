"use client";

import { rankResumes, type RankResumesInput, type RankResumesOutput } from "@/ai/flows/rank-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { RankedResume as UIRankedResume } from "@/types";
import { useState } from "react";
import { Loader2, FileText, Percent, ArrowDownUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Progress } from "@/components/ui/progress";


export function ResumeRankerClient() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeTexts, setResumeTexts] = useState<string[]>(["", "", ""]); // Start with 3 resume inputs
  const [rankedResumes, setRankedResumes] = useState<UIRankedResume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleRankResumes = async () => {
    if (!jobDescription.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Job description cannot be empty." });
      return;
    }
    const validResumes = resumeTexts.map(r => r.trim()).filter(Boolean);
    if (validResumes.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please provide at least one resume." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRankedResumes([]);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 10, 90));
    }, 300);


    try {
      const input: RankResumesInput = {
        jobDescription,
        resumes: validResumes,
      };
      const result = await rankResumes(input);
      // Sort by rank descending
      result.sort((a, b) => b.rank - a.rank);
      setRankedResumes(result);
      toast({ title: "Resumes Ranked", description: `Successfully ranked ${result.length} resumes.` });
    } catch (e) {
      console.error("Failed to rank resumes:", e);
      setError("Could not rank resumes. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to rank resumes." });
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleResumeTextChange = (index: number, value: string) => {
    const newResumeTexts = [...resumeTexts];
    newResumeTexts[index] = value;
    setResumeTexts(newResumeTexts);
  };

  const addResumeField = () => {
    setResumeTexts([...resumeTexts, ""]);
  };
  
  const removeResumeField = (index: number) => {
    if (resumeTexts.length <= 1) return; // Keep at least one field
    const newResumeTexts = resumeTexts.filter((_, i) => i !== index);
    setResumeTexts(newResumeTexts);
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent"/>AI Resume Ranker</CardTitle>
          <CardDescription>
            Enter a job description and student resumes (text format) to rank them by relevance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobDescription" className="font-semibold">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[150px] mt-1"
            />
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Resumes (Paste Text)</Label>
            {resumeTexts.map((text, index) => (
              <div key={index} className="space-y-1 relative group">
                <Label htmlFor={`resume-${index}`} className="text-xs text-muted-foreground">Resume {index + 1}</Label>
                <Textarea
                  id={`resume-${index}`}
                  placeholder={`Paste resume ${index + 1} text here...`}
                  value={text}
                  onChange={(e) => handleResumeTextChange(index, e.target.value)}
                  className="min-h-[120px]"
                />
                {resumeTexts.length > 1 && (
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => removeResumeField(index)}
                     className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                     Remove
                   </Button>
                )}
              </div>
            ))}
             <Button variant="outline" size="sm" onClick={addResumeField}>Add another resume field</Button>
          </div>

          <Button onClick={handleRankResumes} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDownUp className="mr-2 h-4 w-4" />}
            Rank Resumes
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="space-y-2">
          <Progress value={loadingProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">AI is processing the resumes...</p>
        </div>
      )}
      {error && <p className="text-destructive text-center">{error}</p>}

      {rankedResumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ranked Resumes</CardTitle>
            <CardDescription>Resumes are ranked from most to least relevant based on the job description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankedResumes.map((item, index) => (
              <Card key={index} className="bg-secondary/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Resume {index + 1} (Original Index: {resumeTexts.findIndex(t => t === item.resume) + 1})
                    </CardTitle>
                    <Badge className="text-base">
                      <Percent className="mr-1 h-4 w-4"/> {(item.rank * 100).toFixed(0)}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-sm mb-1">Reasoning:</p>
                  <p className="text-sm text-muted-foreground mb-3">{item.reason}</p>
                  <p className="font-semibold text-sm mb-1">Resume Content (First 200 chars):</p>
                  <p className="text-xs text-muted-foreground bg-background p-2 rounded-md whitespace-pre-wrap break-words">
                    {item.resume.substring(0, 200)}{item.resume.length > 200 ? "..." : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
