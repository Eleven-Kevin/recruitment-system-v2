import { BriefcaseBusiness } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-headline text-primary hover:text-accent transition-colors">
      <BriefcaseBusiness className="h-6 w-6 text-accent" />
      <span>CampusConnect</span>
    </Link>
  );
}
