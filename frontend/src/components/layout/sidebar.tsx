"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebar.store";
import { useProjectStore } from "@/stores/project.store";
import { useBoardStore } from "@/stores/board.store";
import { MAIN_NAV_ITEMS, OTHER_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { FavoriteListSidebar } from "@/features/favorites/components/favorite-list-sidebar";
import { ProjectListSidebar } from "@/features/projects/components/project-list-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarTooltipProps {
  content: string;
  disabled?: boolean;
  children: React.ReactElement;
}

function SidebarTooltip({ content, disabled, children }: SidebarTooltipProps) {
  if (disabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  // States to clear active nodes when Dashboard is clicked
  const { activeProjectId, setActiveProjectId } = useProjectStore();
  const { activeBoardId, setActiveBoardId } = useBoardStore();

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveProjectId(null);
    setActiveBoardId(null);
    router.push("/");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-full select-none",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* 1. Workspace Switcher */}
        <div className="px-3 border-b border-sidebar-border flex items-center justify-between h-14 shrink-0">
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* 2. Search Area (Placeholder Button) */}
        <div className="p-2.5">
          {!isCollapsed ? (
            <button
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border hover:bg-sidebar-accent transition-colors text-xs text-sidebar-foreground/60 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              aria-label="Search Workspace"
            >
              <span className="truncate flex-1">Search workspace...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-sidebar-border bg-sidebar px-1 font-mono text-[10px] font-medium opacity-80">
                ⌘K
              </kbd>
            </button>
          ) : (
            <SidebarTooltip content="Search Workspace (⌘K)" disabled={!isCollapsed}>
              <button
                className="w-9 h-9 rounded hover:bg-sidebar-accent flex items-center justify-center transition-colors mx-auto text-sidebar-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                aria-label="Search Workspace"
              >
                <kbd className="font-mono text-[10px] opacity-80">⌘K</kbd>
              </button>
            </SidebarTooltip>
          )}
        </div>

        {/* Main Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-4">
          {/* Navigation Items (Main & Links) */}
          <div className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              
              // Custom active state logic
              let isActive = pathname === item.href;
              if (item.href === "/") {
                isActive = pathname === "/" && !activeProjectId && !activeBoardId;
              }

              // Intercept Dashboard click
              const onClick = item.href === "/" ? handleDashboardClick : undefined;

              return (
                <SidebarTooltip key={item.name} content={item.name} disabled={!isCollapsed}>
                  <Link
                    href={item.disabled ? "#" : item.href}
                    onClick={onClick}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[14px] transition-all font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive
                        ? "bg-sidebar-accent text-foreground font-semibold border-l border-primary/60 pl-2 rounded-l-none"
                        : "border-transparent hover:bg-sidebar-accent/50 text-sidebar-foreground/75 hover:text-sidebar-foreground",
                      item.disabled && "pointer-events-none opacity-50",
                      isCollapsed && "justify-center px-0 border-l-0 rounded-md"
                    )}
                    title={isCollapsed ? undefined : item.name}
                    aria-label={item.name}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </SidebarTooltip>
              );
            })}
          </div>

          {/* Favorites List Section (Dynamic) */}
          <FavoriteListSidebar isCollapsed={isCollapsed} />

          {/* 4. Projects & Boards List Section (Dynamic Collapsible) */}
          <ProjectListSidebar isCollapsed={isCollapsed} />

          {/* Other navigation section */}
          <div className="pt-2.5 border-t border-sidebar-border space-y-1">
            {OTHER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarTooltip key={item.name} content={item.name} disabled={!isCollapsed}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[14px] transition-all font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive
                        ? "bg-sidebar-accent text-foreground font-semibold border-l border-primary/60 pl-2 rounded-l-none"
                        : "border-transparent hover:bg-sidebar-accent/50 text-sidebar-foreground/75 hover:text-sidebar-foreground",
                      isCollapsed && "justify-center px-0 border-l-0 rounded-md"
                    )}
                    title={isCollapsed ? undefined : item.name}
                    aria-label={item.name}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                </SidebarTooltip>
              );
            })}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
