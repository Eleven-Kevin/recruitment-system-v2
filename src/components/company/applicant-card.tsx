
import type { Student, Application } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Star, ExternalLink, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

interface ApplicantCardProps {
  student: Partial<Student>; // Partial as we might only have summary data
  application: Partial<Application>;
}

export function ApplicantCard({ student, application }: ApplicantCardProps) {
  const studentInitial = student.name ? student.name.charAt(0).toUpperCase() : "S";
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={student.profilePictureUrl || `https://placehold.co/100x100.png?text=${studentInitial}`} alt={student.name || "Student avatar"} data-ai-hint="student photo"/>
          <AvatarFallback>{studentInitial}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl font-headline">{student.name || "N/A"}</CardTitle>
          <CardDescription>{student.major || "Major not specified"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <GraduationCap className="mr-2 h-4 w-4 text-accent" />
          GPA: {student.gpa ? student.gpa.toFixed(2) : "N/A"}
        </div>
        {student.skills && student.skills.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Key Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {student.skills.slice(0, 5).map((skill, index) => ( // Show max 5 skills
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
              {student.skills.length > 5 && <Badge variant="outline">+{student.skills.length - 5} more</Badge>}
            </div>
          </div>
        )}
        {application.status && (
          <div className="pt-2">
             <Badge variant="outline" className="capitalize">Status: {application.status}</Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {/* In a real app, student.id would be used for the link */}
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto group">
          <Link href={`/admin/students/${student.id || 'view'}`}> 
            View Full Profile <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Link>
        </Button>
         {student.resumeUrl && (
          <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
            <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" /> View Resume
            </a>
          </Button>
        )}
        <Button variant="default" size="sm" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
            <MessageSquare className="mr-2 h-4 w-4" /> Schedule Interview
        </Button>
      </CardFooter>
    </Card>
  );
}
