
"use client";
import { PageHeader } from "@/components/core/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building, Loader2, ExternalLink, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import type { Company } from "@/types";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { AddCompanyForm } from "@/components/admin/add-company-form";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/companies");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch companies.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Placeholder for delete functionality
  async function handleDeleteCompany(companyId: number) {
    if (!confirm("Are you sure you want to delete this company? This may affect associated jobs and users.")) {
      return;
    }
    // TODO: Implement actual API call for deletion: DELETE /api/admin/companies/${companyId}
    toast({
        title: "Info",
        description: `Deletion for company ID ${companyId} not yet implemented.`,
        variant: "default"
    });
  }


  return (
    <>
      <PageHeader
        title="Manage Companies"
        description="Oversee company listings, verify accounts, and manage partnerships."
        actions={
          <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>
                  Fill in the details below to register a new company on the platform.
                </DialogDescription>
              </DialogHeader>
              <AddCompanyForm onSuccess={() => {
                setIsAddCompanyDialogOpen(false);
                fetchCompanies();
              }} />
            </DialogContent>
          </Dialog>
        }
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-2 text-muted-foreground">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-10">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Companies Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new company.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card text-card-foreground shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead className="min-w-[200px]">Website</TableHead>
                <TableHead className="text-right min-w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{company.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[250px] truncate">{company.description || "N/A"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {company.website ? (
                      <Link href={company.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center text-sm">
                        Visit <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled className="mr-2">Edit</Button>
                     <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
