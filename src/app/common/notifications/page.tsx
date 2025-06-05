
import { PageHeader } from "@/components/core/page-header";
import type { Notification } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BellRing, Check, Trash2, Info, AlertTriangle, Briefcase } from "lucide-react";
import Link from "next/link";

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: "notif1",
    userId: "user123",
    message: "Your application for Software Engineer at Tech Solutions Inc. has been shortlisted!",
    type: "application_status",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    link: "/student/applications"
  },
  {
    id: "notif2",
    userId: "user123",
    message: "Interview scheduled with Innovatech for Data Analyst Co-op on Jan 25, 2025, 10:00 AM.",
    type: "interview_schedule",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    link: "/student/applications" // Or a dedicated interview page
  },
  {
    id: "notif3",
    userId: "user123",
    message: "Creative Designs LLC has viewed your profile.",
    type: "company_update",
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "notif4",
    userId: "user123",
    message: "New job posting: AI Research Assistant at Future AI Labs. Matches your profile!",
    type: "new_job",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    link: "/student/job-recommendations"
  },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'application_status': return <Briefcase className="h-4 w-4 text-blue-500" />;
    case 'interview_schedule': return <BellRing className="h-4 w-4 text-green-500" />;
    case 'company_update': return <Info className="h-4 w-4 text-yellow-500" />;
    case 'new_job': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default: return <BellRing className="h-4 w-4 text-gray-500" />;
  }
};

export default function NotificationsPage() {
  // In a real app, you'd manage read/unread state and deletion
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated with application statuses, interview schedules, and company updates."
        actions={
          <>
            <Button variant="outline" size="sm" disabled><Check className="mr-2 h-4 w-4"/>Mark All as Read</Button>
            <Button variant="destructive" size="sm" disabled><Trash2 className="mr-2 h-4 w-4"/>Clear All</Button>
          </>
        }
      />
      {mockNotifications.length > 0 ? (
        <div className="space-y-4">
          {mockNotifications.map((notif) => (
            <Card key={notif.id} className={cn("hover:shadow-md transition-shadow", !notif.isRead && "bg-accent/5 border-accent")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <NotificationIcon type={notif.type} />
                    <CardTitle className={cn("text-base font-medium leading-tight", !notif.isRead && "font-semibold")}>
                      {notif.type.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}
                    </CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className={cn("text-sm", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                  {notif.message}
                </p>
                {notif.link && (
                  <Button variant="link" asChild className="p-0 h-auto mt-2 text-accent">
                    <Link href={notif.link}>View Details</Link>
                  </Button>
                )}
              </CardContent>
               {!notif.isRead && (
                 <CardFooter className="pt-0 pb-3">
                    <Button variant="ghost" size="sm" className="ml-auto text-xs" disabled>Mark as Read</Button>
                 </CardFooter>
               )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BellRing className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No New Notifications</h3>
            <p className="text-muted-foreground">
              You&apos;re all caught up! We&apos;ll let you know when there&apos;s something new.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// Helper for cn if not globally available in this snippet (it is via utils)
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
