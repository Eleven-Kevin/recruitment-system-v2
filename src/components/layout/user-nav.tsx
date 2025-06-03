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
import { usePathname } from "next/navigation";

// Determine current role based on path. This is a simplified approach.
// In a real app, this would come from auth context.
const getRoleFromPath = (path: string): string | null => {
  if (path.startsWith("/student")) return "student";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/company")) return "company";
  if (path.startsWith("/college")) return "college";
  return null;
};

export function UserNav() {
  const pathname = usePathname();
  const role = getRoleFromPath(pathname);

  let profileLink = "/login";
  if (role === "student") profileLink = "/student/profile";
  // Other roles might not have a dedicated "profile" page in this structure
  // but could link to their dashboard or settings.

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="person avatar" />
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">CampusConnect User</p>
            <p className="text-xs leading-none text-muted-foreground">
              {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Account` : "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {role === "student" && (
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
        <Link href="/login" passHref>
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
