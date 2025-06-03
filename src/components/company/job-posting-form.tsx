"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Job } from "@/types";
import { useToast } from "@/hooks/use-toast";

const jobPostingSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  requiredSkills: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  requiredGpa: z.coerce.number().min(0).max(4).optional(),
  location: z.string().optional(),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  job?: Partial<Job>; // Optional initial data for editing
  onSubmitSuccess?: (data: Job) => void;
}

export function JobPostingForm({ job, onSubmitSuccess }: JobPostingFormProps) {
  const { toast } = useToast();
  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      requiredSkills: job?.requiredSkills?.join(', ') || "",
      requiredGpa: job?.requiredGpa || undefined,
      location: job?.location || "",
    },
  });

  function onSubmit(data: JobPostingFormValues) {
    console.log("Job posting data:", data);
    // Simulate API call and success
    const newOrUpdatedJob: Job = {
      id: job?.id || `job-${Date.now()}`, // Generate ID if new
      companyId: job?.companyId || "company-placeholder", // This would come from auth
      status: job?.status || "open",
      postedDate: job?.postedDate || new Date().toISOString(),
      ...data,
      requiredSkills: data.requiredSkills // already transformed
    };
    
    toast({
      title: job?.id ? "Job Updated" : "Job Posted",
      description: `Job "${newOrUpdatedJob.title}" has been successfully ${job?.id ? 'updated' : 'posted'}.`,
    });
    if (onSubmitSuccess) {
      onSubmitSuccess(newOrUpdatedJob);
    }
    if(!job?.id) form.reset(); // Reset form if it was a new posting
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Software Engineer Intern" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of the job responsibilities, requirements, and company culture..."
                  className="resize-y min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="requiredSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., React, Python, Java" {...field} />
                </FormControl>
                <FormDescription>
                  Enter skills, separated by commas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="requiredGpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Required GPA (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 3.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New York, NY or Remote" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {job?.id ? "Update Job Posting" : "Post Job"}
        </Button>
      </form>
    </Form>
  );
}
