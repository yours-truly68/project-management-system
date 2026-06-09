"use client";

import * as React from "react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export default function SettingsPage() {
  return (
    <div className="flex flex-col space-y-6 select-none max-w-4xl">

      {/* Profile Section Preview (Utility mockup) */}
      <div className="bg-secondary/20 rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground/90">User Profile</h2>
        <p className="text-xs text-muted-foreground">
          Your account credentials and email notification settings are synchronized with your authenticated session.
        </p>
        <div className="flex flex-col gap-3 max-w-md pt-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Account Access</span>
            <div className="px-3.5 py-2.5 rounded bg-secondary/50 border border-border text-xs text-foreground font-medium">
              Verified User Session Active
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-secondary/20 rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground/90">Appearance</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select how KanDo looks on your interface. Choose light mode, dark mode, or follow your operating system settings.
          </p>
        </div>

        {/* Theme Switcher Integration */}
        <div className="pt-2">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
