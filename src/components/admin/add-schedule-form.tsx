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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Schedule, Job } from "@/types";
import { DialogClose } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const addScheduleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional(),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().optional(), // e.g., "10:00 AM"
  location: z.string().optional(),
  jobId: z.coerce.number().int().positive().optional().nullable(),
});

type AddScheduleFormValues = z.infer<typeof addScheduleSchema>;

interface AddScheduleFormProps {
  onSuccess?: (data: Schedule) => void;
}

export function AddScheduleForm({ onSuccess }: AddScheduleFormProps) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);

  const form = useForm<AddScheduleFormValues>({
    resolver: zodResolver(addScheduleSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      time: "",
      location: "",
      jobId: null,
    },
  });

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        toast({
          title: "Error fetching jobs",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    }
    fetchJobs();
  }, [toast]);

  async function onSubmit(data: AddScheduleFormValues) {
    try {
      const payload = {
        ...data,
        date: data.date.toISOString(), // Convert Date object to ISO string for API
      };
      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add schedule');
      }
      
      const newSchedule: Schedule = await response.json();

      toast({
        title: "Schedule Added",
        description: `"${newSchedule.title}" has been successfully scheduled.`,
      });
      
      form.reset();
      if (onSuccess) {
        onSuccess(newSchedule);
      }

    } catch (error) {
        console.error('Failed to add schedule:', error);
        toast({
            variant: "destructive",
            title: "Failed to Add Schedule",
            description: (error as Error).message || "An unexpected error occurred.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech Solutions Inc. Campus Drive" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about the event, rounds, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10:00 AM - 04:00 PM" {...field} />
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
                <Input placeholder="e.g., Auditorium A, Main Campus or Virtual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Job (Optional)</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))} defaultValue={field.value?.toString() ?? 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job if this schedule is for a specific role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} - {job.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Linking a job will associate this schedule with the job and its company.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Scheduling..." : "Add Schedule"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
