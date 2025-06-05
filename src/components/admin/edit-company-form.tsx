
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

const editCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  description: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL for the website." }).optional().or(z.literal('')),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }).optional().or(z.literal('')),
});

type EditCompanyFormValues = z.infer<typeof editCompanySchema>;

interface EditCompanyFormProps {
  company: Company;
  onSuccess?: (data: Company) => void;
}

export function EditCompanyForm({ company, onSuccess }: EditCompanyFormProps) {
  const { toast } = useToast();

  const form = useForm<EditCompanyFormValues>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      name: company.name || "",
      description: company.description || "",
      website: company.website || "",
      logoUrl: company.logoUrl || "",
    },
  });

  async function onSubmit(data: EditCompanyFormValues) {
    try {
      const response = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }
      
      const updatedCompany: Company = await response.json();

      toast({
        title: "Company Updated",
        description: `Company "${updatedCompany.name}" has been successfully updated.`,
      });
      
      if (onSuccess) {
        onSuccess(updatedCompany);
      }

    } catch (error) {
        console.error('Failed to update company:', error);
        toast({
            variant: "destructive",
            title: "Failed to Update Company",
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
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
