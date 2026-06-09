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
          isCollapsed ? "w-14" : "w-56"
        )}
      >
        {/* 1. Workspace Switcher (Placeholder Dropdown Button) */}
        <div className="p-2 border-b border-sidebar-border flex items-center justify-between min-h-[44px]">
          {!isCollapsed ? (
            <button
              className="flex items-center gap-2 overflow-hidden w-full text-left rounded p-0.5 hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Workspace Switcher, current workspace: KanDo Workspace"
            >
              <div className="w-5 h-5 rounded bg-sidebar-accent flex items-center justify-center text-xs font-bold shrink-0">
                K
              </div>
              <span className="font-semibold text-sm truncate">KanDo Workspace</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-sidebar-foreground/60 shrink-0" />
            </button>
          ) : (
            <SidebarTooltip content="KanDo Workspace" disabled={!isCollapsed}>
              <button
                className="w-7 h-7 rounded bg-sidebar-accent flex items-center justify-center text-xs font-bold mx-auto hover:bg-sidebar-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Workspace Switcher, current workspace: KanDo Workspace"
              >
                K
              </button>
            </SidebarTooltip>
          )}
        </div>

        {/* 2. Search Area (Placeholder Button) */}
        <div className="p-2">
          {!isCollapsed ? (
            <button
              className="w-full flex items-center gap-1.5 px-2 py-1 rounded bg-sidebar-accent/50 border border-sidebar-border hover:bg-sidebar-accent transition-colors text-[11px] text-sidebar-foreground/60 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Search Workspace"
            >
              <span className="truncate flex-1">Search workspace...</span>
              <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-sidebar-border bg-sidebar px-1 font-mono text-[9px] font-medium opacity-80">
                ⌘K
              </kbd>
            </button>
          ) : (
            <SidebarTooltip content="Search Workspace (⌘K)" disabled={!isCollapsed}>
              <button
                className="w-8 h-8 rounded hover:bg-sidebar-accent flex items-center justify-center transition-colors mx-auto text-sidebar-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Search Workspace"
              >
                <kbd className="font-mono text-[10px] opacity-80">⌘K</kbd>
              </button>
            </SidebarTooltip>
          )}
        </div>

        {/* Main Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-3">
          {/* Navigation Items (Main & Links) */}
          <div className="space-y-0.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarTooltip key={item.name} content={item.name} disabled={!isCollapsed}>
                  <Link
                    href={item.disabled ? "#" : item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      item.disabled && "pointer-events-none opacity-50",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? undefined : item.name}
                    aria-label={item.name}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </SidebarTooltip>
              );
            })}
          </div>

          {/* 3. Favorites List (Placeholder) */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-2 py-0.5 text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
                Favorites
              </div>
            )}
            <div className="space-y-0.5">
              <SidebarTooltip content="Website Redesign" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Favorite workspace item: Website Redesign"
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                  {!isCollapsed && <span className="truncate text-xs font-medium">Website Redesign</span>}
                </button>
              </SidebarTooltip>
              <SidebarTooltip content="Release V1 Specs" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Favorite workspace item: Release V1 Specs"
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                  {!isCollapsed && <span className="truncate text-xs font-medium">Release V1 Specs</span>}
                </button>
              </SidebarTooltip>
            </div>
          </div>

          {/* 4. Projects List Section (Placeholder) */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 py-0.5">
                <span className="text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
                  Projects
                </span>
                <button
                  className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Create new project"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              <SidebarTooltip content="Mobile Application" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Project: Mobile Application"
                >
                  <FolderOpen className="w-3 h-3 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && <span className="truncate text-xs font-medium">Mobile Application</span>}
                </button>
              </SidebarTooltip>
              <SidebarTooltip content="Internal Core API" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Project: Internal Core API"
                >
                  <FolderOpen className="w-3 h-3 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && <span className="truncate text-xs font-medium">Internal Core API</span>}
                </button>
              </SidebarTooltip>
            </div>
          </div>

          {/* 5. Boards List Section (Placeholder) */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 py-0.5">
                <span className="text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
                  Boards
                </span>
                <button
                  className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Create new board"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              <SidebarTooltip content="Sprint 1 Board" disabled={!isCollapsed}>
                <button
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded hover:bg-sidebar-accent/40 w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCollapsed && "justify-center px-0"
                  )}
                  aria-label="Board: Sprint 1 Board"
                >
                  <Compass className="w-3 h-3 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && <span className="truncate text-xs font-medium">Sprint 1 Board</span>}
                </button>
              </SidebarTooltip>
            </div>
          </div>

          {/* Other navigation section */}
          <div className="pt-2 border-t border-sidebar-border space-y-0.5">
            {OTHER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarTooltip key={item.name} content={item.name} disabled={!isCollapsed}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? undefined : item.name}
                    aria-label={item.name}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span className="truncate text-xs font-medium">{item.name}</span>}
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
