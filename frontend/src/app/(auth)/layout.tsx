"use client";

import * as React from "react";
import { GuestGuard } from "@/features/auth/components/guest-guard";
import { FolderKanban } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 select-none">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
          {/* Brand/Logo Header */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground/90">
              KanDo
            </span>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            KanDo — Project Management Platform
          </p>
        </div>

        {/* Content Container Card */}
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="bg-card border border-border px-6 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
