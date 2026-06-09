"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspaces();

  const tabs = [
    {
      name: "Personal & Appearance",
      href: "/settings",
      active: pathname === "/settings",
    },
    {
      name: "Workspace Settings",
      href: "/settings/workspace",
      active: pathname === "/settings/workspace",
      disabled: !activeWorkspace,
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 select-none max-w-4xl px-2 py-4">
      {/* Settings Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90 font-heading">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences, theme settings, and workspaces.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4 text-xs font-semibold pb-px">
        {tabs.map((tab) => {
          if (tab.disabled) return null;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "pb-2.5 border-b-2 transition-all cursor-pointer px-1 -mb-px text-sm",
                tab.active
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="pt-2">{children}</div>
    </div>
  );
}
