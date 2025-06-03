
"use client"; // Required for useEffect and useRouter

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecting to login...</p>
      <p className="text-xs text-muted-foreground mt-2">Account creation is managed by administrators.</p>
    </div>
  );
}
