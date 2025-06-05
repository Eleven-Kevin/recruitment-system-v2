
"use client";
import { PageHeader } from "@/components/core/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building, Loader2, ExternalLink, Trash2, Edit } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react";
import type { Company, Student } from "@/types"; // Added Student type
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { AddCompanyForm } from "@/components/admin/add-company-form";
import { EditCompanyForm } from "@/components/admin/edit-company-form"; // Import EditCompanyForm

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsEditCompanyDialogOpen(true);
  };

  async function handleDeleteCompany(companyId: number) {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete company");
      }
      toast({
        title: "Success",
        description: "Company deleted successfully.",
      });
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete company:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete company.",
        variant: "destructive",
      });
    } finally {
        setIsDeleting(false);
    }
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
                <PlusCircle className="mr-2 h-4 w-4" /> Add Company & User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Company & Representative User</DialogTitle>
                <DialogDescription>
                  Fill in the company details. A representative user account will be created automatically.
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

      {/* Edit Company Dialog */}
      {selectedCompany && (
        <Dialog open={isEditCompanyDialogOpen} onOpenChange={setIsEditCompanyDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Company: {selectedCompany.name}</DialogTitle>
              <DialogDescription>
                Update the details for this company.
              </DialogDescription>
            </DialogHeader>
            <EditCompanyForm 
              company={selectedCompany} 
              onSuccess={() => {
                setIsEditCompanyDialogOpen(false);
                setSelectedCompany(null);
                fetchCompanies();
              }} 
            />
          </DialogContent>
        </Dialog>
      )}


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
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEditCompany(company)}>
                        <Edit className="h-4 w-4 mr-1"/> Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the company
                                "{company.name}". Ensure no jobs or users are critically dependent on this company before proceeding.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => handleDeleteCompany(company.id)} 
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Continue
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
