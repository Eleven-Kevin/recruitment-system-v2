
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
import type { Company } from "@/types";
import { DialogClose } from "@/components/ui/dialog";

const addCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  description: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL for the website." }).optional().or(z.literal('')),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }).optional().or(z.literal('')),
});

type AddCompanyFormValues = z.infer<typeof addCompanySchema>;

interface AddCompanyFormProps {
  onSuccess?: (data: Company) => void; // Data might need to include user credentials now
}

export function AddCompanyForm({ onSuccess }: AddCompanyFormProps) {
  const { toast } = useToast();

  const form = useForm<AddCompanyFormValues>({
    resolver: zodResolver(addCompanySchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      logoUrl: "",
    },
  });

  async function onSubmit(data: AddCompanyFormValues) {
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add company');
      }
      
      // Expecting response to include company details and representativeUser credentials
      const responseData = await response.json();
      const newCompany: Company = {
        id: responseData.id,
        name: responseData.name,
        description: responseData.description,
        website: responseData.website,
        logoUrl: responseData.logoUrl,
      };
      const repUser = responseData.representativeUser;

      let toastDescription = `Company "${newCompany.name}" has been successfully registered.`;
      if (repUser && repUser.email && repUser.password) {
        toastDescription += `\nRepresentative User Credentials:\nEmail: ${repUser.email}\nPassword: ${repUser.password}`;
      }


      toast({
        title: "Company & User Added",
        description: (
            <div className="whitespace-pre-wrap">
                <p>Company &quot;{newCompany.name}&quot; successfully registered.</p>
                {repUser && repUser.email && repUser.password && (
                    <>
                        <p className="mt-2 font-semibold">Representative User Credentials:</p>
                        <p>Email: {repUser.email}</p>
                        <p>Password: {repUser.password} (Share this securely)</p>
                    </>
                )}
            </div>
        ),
        duration: 15000, // Longer duration for credentials
      });
      
      form.reset();
      if (onSuccess) {
        onSuccess(newCompany); // Pass new company data back
      }

    } catch (error) {
        console.error('Failed to add company and user:', error);
        toast({
            variant: "destructive",
            title: "Failed to Add Company & User",
            description: (error as Error).message || "An unexpected error occurred.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
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
                <Textarea placeholder="Briefly describe the company" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://company.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://company.example.com/logo.png" {...field} />
              </FormControl>
              <FormDescription>Link to the company's logo image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Company & User"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
