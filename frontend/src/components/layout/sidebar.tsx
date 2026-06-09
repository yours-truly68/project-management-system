"use client";

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

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-full select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* 1. Workspace Switcher (Placeholder Dropdown) */}
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between min-h-[52px]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <div className="w-6 h-6 rounded bg-sidebar-accent flex items-center justify-center text-xs font-bold shrink-0">
              A
            </div>
            <span className="font-semibold text-sm truncate">Acme Workspace</span>
            <ChevronDown className="w-4 h-4 ml-auto text-sidebar-foreground/60 shrink-0" />
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded bg-sidebar-accent flex items-center justify-center text-sm font-bold mx-auto">
            A
          </div>
        )}
      </div>

      {/* 2. Search Area (Placeholder Button) */}
      <div className="p-3">
        {!isCollapsed ? (
          <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md bg-sidebar-accent/50 border border-sidebar-border hover:bg-sidebar-accent transition-colors text-xs text-sidebar-foreground/60 text-left">
            <span className="truncate flex-1">Search workspace...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        ) : (
          <button className="w-10 h-10 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent flex items-center justify-center transition-colors mx-auto text-sidebar-foreground/60">
            <kbd className="font-mono text-xs">⌘K</kbd>
          </button>
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
              <Link
                key={item.name}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                  item.disabled && "pointer-events-none opacity-50",
                  isCollapsed && "justify-center px-0"
                )}
                title={item.name}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
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
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 cursor-pointer",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              {!isCollapsed && <span className="truncate">Website Redesign</span>}
            </div>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 cursor-pointer",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              {!isCollapsed && <span className="truncate">Release V1 Specs</span>}
            </div>
          </div>
        </div>

        {/* 4. Projects List Section (Placeholder) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Projects
              </span>
              <button className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="space-y-0.5">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 cursor-pointer",
                isCollapsed && "justify-center px-0"
              )}
            >
              <FolderOpen className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
              {!isCollapsed && <span className="truncate">Mobile Application</span>}
            </div>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 cursor-pointer",
                isCollapsed && "justify-center px-0"
              )}
            >
              <FolderOpen className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
              {!isCollapsed && <span className="truncate">Internal Core API</span>}
            </div>
          </div>
        </div>

        {/* 5. Boards List Section (Placeholder) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Boards
              </span>
              <button className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="space-y-0.5">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md hover:bg-sidebar-accent/40 cursor-pointer",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Compass className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
              {!isCollapsed && <span className="truncate">Sprint 1 Board</span>}
            </div>
          </div>
        </div>

        {/* Other navigation section */}
        <div className="pt-2 border-t border-sidebar-border space-y-1">
          {OTHER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                title={item.name}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
