"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User, ShieldQuestion, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [profileLink, setProfileLink] = useState("/login");
  // No need to store companyId in state here, it's used directly for routing if needed
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      const storedRole = localStorage.getItem('userRole');
      const storedEmail = localStorage.getItem('userEmail');
      // const storedCompanyId = localStorage.getItem('companyId'); // Can be fetched if needed

      if (storedName) setUserName(storedName);
      if (storedRole) {
        setUserRole(storedRole);
        if (storedRole === "student") {
          setProfileLink("/student/profile");
        } else if (storedRole === "company") {
          setProfileLink("/company/dashboard"); // Or company profile page if one exists
        }
         else {
           setProfileLink(`/${storedRole}/dashboard`);
        }
      }
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('companyId'); // Clear companyId on logout
    }
    router.push('/login?message=logged_out');
    setTimeout(() => router.refresh(), 100); 
  };

  if (!isClient) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
        <Avatar className="h-9 w-9">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="person avatar"/>
            <AvatarFallback>{userName?.substring(0,2)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account` : (userEmail || "No email")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userRole === "student" && (
            <Link href={profileLink} passHref>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
          )}
           {userRole === "company" && (
            <Link href="/company/job-postings" passHref> {/* Or a dedicated company profile page */}
              <DropdownMenuItem>
                <Building className="mr-2 h-4 w-4" />
                <span>My Postings</span>
              </DropdownMenuItem>
            </Link>
          )}
          {userRole && userRole !== "student" && userRole !== "company" && (
             <Link href={profileLink} passHref>
                <DropdownMenuItem>
                    <ShieldQuestion className="mr-2 h-4 w-4" />
                    <span>My Dashboard</span>
                </DropdownMenuItem>
            </Link>
          )}
           <Link href="/common/notifications" passHref>
            <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
