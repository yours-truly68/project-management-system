"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebar.store";
import { MAIN_NAV_ITEMS, OTHER_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Compass,
  FolderOpen,
  Plus,
  Star,
} from "lucide-react";
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
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-full select-none",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* 1. Workspace Switcher (Placeholder Dropdown Button) */}
        <div className="p-3 border-b border-sidebar-border flex items-center justify-between min-h-[52px]">
          {!isCollapsed ? (
            <button
              className="flex items-center gap-2 overflow-hidden w-full text-left rounded-md p-1 hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Workspace Switcher, current workspace: Acme Workspace"
            >
              <div className="w-6 h-6 rounded bg-sidebar-accent flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <span className="font-semibold text-sm truncate">Acme Workspace</span>
              <ChevronDown className="w-4 h-4 ml-auto text-sidebar-foreground/60 shrink-0" />
            </button>
          ) : (
            <SidebarTooltip content="Acme Workspace" disabled={!isCollapsed}>
              <button
                className="w-8 h-8 rounded bg-sidebar-accent flex items-center justify-center text-sm font-bold mx-auto hover:bg-sidebar-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Workspace Switcher, current workspace: Acme Workspace"
              >
                A
              </button>
            </SidebarTooltip>
          )}
        </div>

        {/* 2. Search Area (Placeholder Button) */}
        <div className="p-3">
          {!isCollapsed ? (
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md bg-sidebar-accent/50 border border-sidebar-border hover:bg-sidebar-accent transition-colors text-xs text-sidebar-foreground/60 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Search Workspace"
            >
              <span className="truncate flex-1">Search workspace...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          ) : (
            <SidebarTooltip content="Search Workspace (⌘K)" disabled={!isCollapsed}>
              <button
                className="w-10 h-10 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent flex items-center justify-center transition-colors mx-auto text-sidebar-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Search Workspace"
              >
                <kbd className="font-mono text-xs">⌘K</kbd>
              </button>
            </SidebarTooltip>
          )}
        </div>

        {/* Main Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {/* Navigation Items (Main & Links) */}
          <div className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarTooltip key={item.name} content={item.name} disabled={!isCollapsed}>
                  <Link
                    href={item.disabled ? "#" : item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      item.disabled && "pointer-events-none opacity-50",
                      isCollapsed && "justify-center px-0"
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

          {/* 3. Favorites List (Placeholder) */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Favorites
              </div>
            )}
            <div className="space-y-0.5">
              <SidebarTooltip content="Website Redesign" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Favorite workspace item: Website Redesign"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  {!isCollapsed && <span className="truncate">Website Redesign</span>}
                </button>
              </SidebarTooltip>
              <SidebarTooltip content="Release V1 Specs" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Favorite workspace item: Release V1 Specs"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  {!isCollapsed && <span className="truncate">Release V1 Specs</span>}
                </button>
              </SidebarTooltip>
            </div>
          </div>

          {/* 4. Projects List Section (Placeholder) */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Projects
                </span>
                <button
                  className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Create new project"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              <SidebarTooltip content="Mobile Application" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Project: Mobile Application"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && <span className="truncate">Mobile Application</span>}
                </button>
              </SidebarTooltip>
              <SidebarTooltip content="Internal Core API" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Project: Internal Core API"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && <span className="truncate">Internal Core API</span>}
                </button>
              </SidebarTooltip>
            </div>
          </div>

          {/* 5. Boards List Section (Placeholder) */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Boards
                </span>
                <button
                  className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Create new board"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              <SidebarTooltip content="Sprint 1 Board" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Board: Sprint 1 Board"
                >
                  <Compass className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && <span className="truncate">Sprint 1 Board</span>}
                </button>
              </SidebarTooltip>
            </div>
          </div>

          {/* Other navigation section */}
          <div className="pt-2 border-t border-sidebar-border space-y-1">
            {OTHER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarTooltip key={item.name} content={item.name} disabled={!isCollapsed}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      isCollapsed && "justify-center px-0"
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
        </div>
      </aside>
    </TooltipProvider>
  );
}
