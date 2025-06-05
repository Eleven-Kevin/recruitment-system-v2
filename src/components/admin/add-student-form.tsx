
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
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/types";
import { DialogClose } from "@/components/ui/dialog";

const addStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  studentId: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.coerce.number().int().positive().optional().nullable(),
  gpa: z.coerce.number().min(0).max(10, "GPA must be between 0 and 10.").optional().nullable(),
  skills: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  preferences: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')).nullable(),
  profilePictureUrl: z.string().url().optional().or(z.literal('')).nullable(),
});

type AddStudentFormValues = z.infer<typeof addStudentSchema>;

interface AddStudentFormProps {
  onSuccess?: (data: Student & { plainPassword?: string }) => void; // Student now includes plainPassword for display
}

export function AddStudentForm({ onSuccess }: AddStudentFormProps) {
  const { toast } = useToast();

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      studentId: "",
      major: "",
      graduationYear: null,
      gpa: null,
      skills: "",
      preferences: "",
      resumeUrl: "",
      profilePictureUrl: "",
    },
  });

  async function onSubmit(data: AddStudentFormValues) {
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...data, role: 'student'}), // Data includes the plain password
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add student');
      }
      
      const responseData = await response.json(); // API now returns student + plainPassword
      const newStudent: Student & { plainPassword?: string } = responseData;


      toast({
        title: "Student Added",
        description: (
            <div className="whitespace-pre-wrap">
                <p>Student &quot;{newStudent.name}&quot; successfully created.</p>
                <p className="mt-2 font-semibold">Login Credentials:</p>
                <p>Email: {newStudent.email}</p>
                <p>Password: {newStudent.plainPassword} (Share this securely)</p>
            </div>
        ),
        duration: 15000, // Longer duration for credentials
      });
      
      form.reset(); 
      if (onSuccess) {
        onSuccess(newStudent); 
      }

    } catch (error) {
        console.error('Failed to add student:', error);
        toast({
            variant: "destructive",
            title: "Failed to Add Student",
            description: (error as Error).message || "An unexpected error occurred.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Student's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="student@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter a secure password" {...field} />
                </FormControl>
                <FormDescription>Min 6 characters. Student will use this to log in.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Student ID (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., S1001" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Major (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Graduation Year (Optional)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 2025" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="gpa"
            render={({ field }) => (
                <FormItem>
                <FormLabel>GPA (0-10 scale) (Optional)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.1" min="0" max="10" placeholder="e.g., 8.5" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="React, Python, Java (comma-separated)" {...field} />
              </FormControl>
              <FormDescription>Enter skills, separated by commas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="resumeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Link to student's resume PDF" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profilePictureUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Link to student's profile picture" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferences (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific job preferences for the student..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Student"}
            </Button>
        </div>
      </form>
    </Form>
  );
}

