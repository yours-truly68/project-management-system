"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import { User, Settings, Users, AlertTriangle } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspaces();

  const menuItems = [
    {
      name: "General",
      href: "/settings",
      active: pathname === "/settings",
      icon: User,
    },
    {
      name: "Workspace Settings",
      href: "/settings/workspace",
      active: pathname === "/settings/workspace",
      disabled: !activeWorkspace,
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-5 select-none max-w-[1000px] w-full mx-auto px-4 py-4 animate-fade-in">
      {/* Settings Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account preferences, theme settings, workspaces, and team memberships.
        </p>
      </div>

      {/* Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-start">
        {/* Settings Navigation Sidebar */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b border-border md:border-b-0" aria-label="Settings sub-navigation">
          {menuItems.map((item) => {
            if (item.disabled) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-r-md border-l-2 text-sm font-medium transition-all shrink-0",
                  item.active
                    ? "bg-accent border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Settings Content Area */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

