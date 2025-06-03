
"use client";

import { useEffect, useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface WithAuthProps {
  // You can add any additional props expected by the wrapped component
}

export function withAuth<P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: string[]
) {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

      if (!userRole) {
        router.replace('/login?message=session_expired');
        return;
      }

      if (allowedRoles.includes(userRole)) {
        setIsAuthorized(true);
      } else {
        console.warn(`Unauthorized access attempt by role '${userRole}' to a page requiring one of ${allowedRoles.join(', ')}.`);
        router.replace('/login?message=unauthorized'); // Or a dedicated unauthorized page
      }
      setIsLoading(false);
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Authenticating...</p>
        </div>
      );
    }

    if (!isAuthorized) {
       // This case should ideally be handled by the redirect, but as a fallback:
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-destructive">Redirecting to login...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ComponentWithAuth;
}
