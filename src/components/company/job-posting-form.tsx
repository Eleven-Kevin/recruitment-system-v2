
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
import type { Job, Company } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const jobPostingSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  companyId: z.coerce.number().positive({ message: "Company is required."}),
  requiredSkills: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  requiredGpa: z.coerce.number().min(0).max(4).optional().nullable(),
  location: z.string().optional(),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  job?: Partial<Omit<Job, 'id' | 'companyName' | 'postedDate' | 'status'>> & { id?: number };
  companies: Company[];
  onSubmitSuccess?: (data: Job) => void;
}

export function JobPostingForm({ job, companies, onSubmitSuccess }: JobPostingFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loggedInCompanyId, setLoggedInCompanyId] = useState<number | null>(null);
  const [loggedInCompanyName, setLoggedInCompanyName] = useState<string | undefined>(undefined);
  const [isCompanyUser, setIsCompanyUser] = useState(false);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      companyId: job?.companyId || undefined, // Initialize as undefined, will be set in useEffect
      requiredSkills: job?.requiredSkills?.join(', ') || "",
      requiredGpa: job?.requiredGpa || null,
      location: job?.location || "",
    },
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      const companyIdStr = localStorage.getItem('companyId');
      
      if (role === 'company' && companyIdStr) {
        const numCompanyId = parseInt(companyIdStr, 10);
        setLoggedInCompanyId(numCompanyId);
        setIsCompanyUser(true);
        form.setValue('companyId', numCompanyId, { shouldValidate: true, shouldDirty: true });
        const companyDetails = companies.find(c => c.id === numCompanyId);
        if (companyDetails) {
          setLoggedInCompanyName(companyDetails.name);
        }
      } else if (!job?.companyId && companies.length > 0) {
        // This part is for non-company users, e.g. admin, or if job has no companyId
        const firstValidCompany = companies.find(c => c.id > 0);
        if (firstValidCompany && !form.getValues("companyId")) { 
            form.setValue('companyId', firstValidCompany.id, { shouldValidate: true, shouldDirty: true });
        }
      } else if (job?.companyId) {
        // If job has a companyId (e.g., editing), ensure it's set
        form.setValue('companyId', job.companyId, { shouldValidate: true, shouldDirty: true });
      }
      setIsUserDataLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.companyId, companies, form.setValue, form.getValues]);


  async function onSubmit(data: JobPostingFormValues) {
    const payload = { ...data };
    // companyId is already correctly set by the useEffect and form.setValue
    
    if (!payload.companyId || payload.companyId <= 0) {
        toast({ variant: "destructive", title: "Error", description: "A valid company must be selected or associated." });
        return;
    }

    const apiPath = job?.id ? `/api/jobs/${job.id}` : '/api/jobs';
    const method = job?.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiPath, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${job?.id ? 'update' : 'post'} job`);
      }
      
      const resultJob: Job = await response.json();

      toast({
        title: job?.id ? "Job Updated" : "Job Posted",
        description: `Job "${resultJob.title}" has been successfully ${job?.id ? 'updated' : 'posted'}.`,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(resultJob);
      }
      
      if (!job?.id) { 
        // Reset form for new job posting
        let defaultCompanyIdAfterReset = undefined;
        if (isCompanyUser && loggedInCompanyId) {
            defaultCompanyIdAfterReset = loggedInCompanyId;
        } else if (companies.find(c=>c.id > 0)) {
            defaultCompanyIdAfterReset = companies.find(c=>c.id > 0)?.id;
        }
        form.reset({ 
            title: "", 
            description: "", 
            companyId: defaultCompanyIdAfterReset, 
            requiredSkills: "",
            requiredGpa: null,
            location: ""
        });
        router.push('/company/job-postings'); 
      } else {
        router.refresh(); 
      }

    } catch (error) {
        console.error(`Failed to ${job?.id ? 'update' : 'post'} job:`, error);
        let errorMessage = "An unexpected error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        toast({
            variant: "destructive",
            title: `${job?.id ? 'Update' : 'Post'} Failed`,
            description: errorMessage,
        });
    }
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
        
        {!isUserDataLoaded ? (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Skeleton className="h-10 w-full" />
              <FormDescription>Loading company information...</FormDescription>
            </FormItem>
        ) : isCompanyUser && loggedInCompanyId ? (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input
                value={loggedInCompanyName || 'Your Company'}
                disabled
                className="bg-muted/50"
              />
            </FormControl>
            <FormDescription>Your company is automatically selected.</FormDescription>
            {/* Ensure companyId is registered with the form for submission */}
            <input type="hidden" {...form.register("companyId")} value={loggedInCompanyId} />
          </FormItem>
        ) : (
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                  disabled={companies.filter(c => c.id > 0).length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.filter(c => c.id > 0).map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                     {companies.filter(c => c.id > 0).length === 0 && (
                        <SelectItem value="no-company" disabled>No companies available (Seed DB or Add Company)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
                  <Input type="number" step="0.01" placeholder="e.g., 3.0" {...field} value={field.value ?? ""} />
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
                <Input placeholder="e.g., New York, NY or Remote" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting || !isUserDataLoaded}>
          {form.formState.isSubmitting ? (job?.id ? "Updating..." : "Posting...") : (job?.id ? "Update Job Posting" : "Post Job")}
        </Button>
      </form>
    </Form>
  );
}
