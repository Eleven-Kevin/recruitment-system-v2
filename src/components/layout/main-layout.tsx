import type React from 'react';
import { AppLogo } from '@/components/core/app-logo';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import type { NavItem } from '@/lib/constants';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role?: string;
}

export function MainLayout({ children, navItems, role }: MainLayoutProps) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-sidebar lg:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-[60px] items-center border-b px-6">
            <AppLogo />
          </div>
          <ScrollArea className="flex-1">
            <SidebarNav items={navItems} />
          </ScrollArea>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-[60px] items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-sidebar">
               <div className="flex h-[60px] items-center border-b px-6">
                <AppLogo />
              </div>
              <ScrollArea className="flex-1">
                <SidebarNav items={navItems} />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            {/* Optional: Breadcrumbs or page title can go here */}
            {role && <span className="text-sm text-muted-foreground font-medium">{role.charAt(0).toUpperCase() + role.slice(1)} Portal</span>}
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
