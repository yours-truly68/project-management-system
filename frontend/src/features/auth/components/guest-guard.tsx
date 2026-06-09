"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isRestoringSession } = useAuthStore();

  React.useEffect(() => {
    if (!isRestoringSession && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isRestoringSession, router]);

  if (isRestoringSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
export default GuestGuard;
