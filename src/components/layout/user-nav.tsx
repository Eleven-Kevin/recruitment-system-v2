
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
import { Bell, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Changed from usePathname
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const [userName, setUserName] = useState("CampusConnect User");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [profileLink, setProfileLink] = useState("/login"); // Default if not logged in or not student

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      const storedRole = localStorage.getItem('userRole');
      const storedEmail = localStorage.getItem('userEmail');

      if (storedName) setUserName(storedName);
      if (storedRole) {
        setUserRole(storedRole);
        if (storedRole === "student") {
          setProfileLink("/student/profile");
        } else {
          // Other roles might not have a dedicated "profile" page,
          // or you might want to link them to their respective dashboards or a settings page.
          // For now, keep it generic or link to their dashboard if desired.
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
    }
    // Optionally, inform backend about logout if session is managed there
    router.push('/login');
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="person avatar"/>
            <AvatarFallback>{userName.substring(0,2).toUpperCase() || "CC"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account` : userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userRole === "student" && ( // Only show profile link for students or adapt as needed
            <Link href={profileLink} passHref>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
          )}
           <Link href="/common/notifications" passHref>
            <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Use Button for logout to attach onClick handler */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
