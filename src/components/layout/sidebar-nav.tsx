
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import * as LucideIcons from 'lucide-react'; // Import all icons

interface SidebarNavProps {
  items: NavItem[];
  className?: string;
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className={cn('flex flex-col gap-1 px-2 py-4', className)}>
      {items.map((item, index) => {
        // Dynamically get the icon component
        // Using a more general type assertion for LucideIcons index
        const IconComponent = LucideIcons[item.iconName as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
        const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);

        if (item.subItems && item.subItems.length > 0) {
          return (
            <Accordion type="single" collapsible className="w-full" key={index}>
              <AccordionItem value={item.label} className="border-none">
                <AccordionTrigger
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                    " [&[data-state=open]>svg:last-child]:rotate-0" // Keep chevron rotation default
                  )}
                >
                  <div className="flex items-center gap-3">
                     <IconComponent className="h-4 w-4" />
                    {item.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="ml-4 mt-1 border-l border-sidebar-border pl-4">
                  {item.subItems.map((subItem) => {
                    const SubIconComponent = LucideIcons[subItem.iconName as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
                    const isSubActive = subItem.matchExact ? pathname === subItem.href : pathname.startsWith(subItem.href);
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isSubActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                        )}
                      >
                        <SubIconComponent className="h-4 w-4" />
                        {subItem.label}
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        }

        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
            )}
          >
            <IconComponent className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
