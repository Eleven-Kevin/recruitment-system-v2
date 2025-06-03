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
import type { Student } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
  studentId: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.coerce.number().int().positive().optional(),
  gpa: z.coerce.number().min(0).max(4).optional(), // Assuming a 4-point GPA scale
  skills: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []), // Comma-separated string to array
  preferences: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  profilePictureUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface StudentProfileFormProps {
  student?: Student; // Optional initial data
}

export function StudentProfileForm({ student }: StudentProfileFormProps) {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: student?.name || "",
      email: student?.email || "",
      studentId: student?.studentId || "",
      major: student?.major || "",
      graduationYear: student?.graduationYear || undefined,
      gpa: student?.gpa || undefined,
      skills: student?.skills?.join(', ') || "",
      preferences: student?.preferences || "",
      resumeUrl: student?.resumeUrl || "",
      profilePictureUrl: student?.profilePictureUrl || "https://placehold.co/150x150.png",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log("Profile data:", data);
    // Here you would typically send the data to your backend API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
              <Image
                src={form.watch("profilePictureUrl") || "https://placehold.co/150x150.png"}
                alt="Profile Picture"
                width={150}
                height={150}
                className="rounded-full object-cover aspect-square"
                data-ai-hint="student portrait"
              />
              <div className="flex-1 w-full">
                <FormField
                  control={form.control}
                  name="profilePictureUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/your-image.png" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL of your profile picture. Use a square image for best results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
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
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Your student ID" {...field} />
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
                    <FormLabel>Major/Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2025" {...field} />
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
                    <FormLabel>GPA</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 3.8" {...field} />
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
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, Python, Data Analysis" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your skills, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Link to your online resume (e.g., Google Drive, Dropbox)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a publicly accessible link to your resume PDF.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferences</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your job preferences, desired roles, or industries..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
