"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import { User, Settings as SettingsIcon } from "lucide-react";
import { PageContainer } from "@/components/ui/primitives";

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
      icon: SettingsIcon,
    },
  ];

  return (
    <PageContainer className="animate-fade-in select-none">
      {/* Settings Header */}
      <div className="space-y-1 border-b border-border pb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account preferences, theme settings, workspaces, and team memberships.
        </p>
      </div>

      {/* Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-start pt-6 flex-1 min-h-0 overflow-auto">
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
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0",
                  item.active
                    ? "bg-sidebar-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
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
    </PageContainer>
  );
}

