"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isRestoringSession } = useAuthStore();

  React.useEffect(() => {
    if (!isRestoringSession && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isRestoringSession, router]);

  // Loading-first route guard to prevent unauthenticated flashes
  if (isRestoringSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-medium text-muted-foreground">Restoring session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
export default AuthGuard;
