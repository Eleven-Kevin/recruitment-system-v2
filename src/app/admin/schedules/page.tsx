
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/core/page-header";
import { Button } from "@/components/ui/button";
import { CalendarDays, Loader2, PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddScheduleForm } from "@/components/admin/add-schedule-form";
import type { Schedule } from "@/types";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function AdminSchedulesPage() {
  const [isAddScheduleDialogOpen, setIsAddScheduleDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSchedules() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/schedules");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schedules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

   async function handleDeleteSchedule(scheduleId: number) {
    // TODO: Implement actual API call for deletion
    if (!confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
      return;
    }
    toast({
        title: "Info",
        description: `Deletion for schedule ID ${scheduleId} not yet implemented.`,
        variant: "default"
    });
    // Example for future:
    // try {
    //   const response = await fetch(`/api/admin/schedules/${scheduleId}`, {
    //     method: "DELETE",
    //   });
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.error || "Failed to delete schedule");
    //   }
    //   toast({
    //     title: "Success",
    //     description: "Schedule deleted successfully.",
    //   });
    //   fetchSchedules(); // Refresh the list
    // } catch (error) {
    //   console.error("Failed to delete schedule:", error);
    //   toast({
    //     title: "Error",
    //     description: (error as Error).message || "Failed to delete schedule.",
    //     variant: "destructive",
    //   });
    // }
  }


  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <>
      <PageHeader
        title="Recruitment Schedules"
        description="Manage and oversee campus recruitment drives and interview schedules."
        actions={
          <Dialog open={isAddScheduleDialogOpen} onOpenChange={setIsAddScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new recruitment schedule.
                </DialogDescription>
              </DialogHeader>
              <AddScheduleForm onSuccess={() => {
                setIsAddScheduleDialogOpen(false);
                fetchSchedules();
              }} />
            </DialogContent>
          </Dialog>
        }
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-2 text-muted-foreground">Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-10">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Schedules Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new schedule.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card text-card-foreground shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[150px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Time</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="min-w-[150px]">Related Job</TableHead>
                <TableHead className="min-w-[150px]">Company</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{schedule.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">{schedule.description || "N/A"}</TableCell>
                  <TableCell>{format(new Date(schedule.date), "PPP")}</TableCell>
                  <TableCell>{schedule.time || "N/A"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{schedule.location || "N/A"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{schedule.jobTitle || "N/A"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{schedule.companyName || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    {/* Future: Edit button */}
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
