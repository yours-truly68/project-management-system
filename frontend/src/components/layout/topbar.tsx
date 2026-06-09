"use client";

import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";

export function Topbar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const toggleMobileOpen = useSidebarStore((state) => state.toggleMobileOpen);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 h-14 shrink-0 select-none">
      {/* Left section: Collapse Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleMobileOpen}
          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground md:hidden transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>

        {/* Desktop/Tablet collapse trigger */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand sidebar panel" : "Collapse sidebar panel"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-[18px] h-[18px]" />
          ) : (
            <PanelLeftClose className="w-[18px] h-[18px]" />
          )}
        </button>

        {/* Breadcrumbs placeholder */}
        <nav className="flex items-center gap-2 text-[13px] text-muted-foreground" aria-label="Breadcrumb navigation">
          <button
            className="hover:text-foreground font-medium rounded px-1.5 py-0.5 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Workspace: KanDo Workspace"
          >
            KanDo Workspace
          </button>
          <span>/</span>
          <button
            className="hover:text-foreground font-medium rounded px-1.5 py-0.5 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Project: Website Redesign"
          >
            Website Redesign
          </button>
          <span>/</span>
          <span className="text-foreground font-semibold px-1.5 py-0.5" aria-current="page">Sprint 1 Board</span>
        </nav>
      </div>

      {/* Right section: Search Trigger, Notifications, Profile Menu */}
      <div className="flex items-center gap-3.5">
        {/* Sleek Command-Search Bar for larger viewports */}
        <button
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded bg-secondary/50 border border-border hover:bg-secondary hover:border-muted-foreground/20 transition-all text-left text-xs text-muted-foreground w-52 lg:w-72 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          aria-label="Search Workspace"
        >
          <Search className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span className="flex-1 truncate">Search workspace...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[10px] font-medium text-muted-foreground/80 shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Compact Search Trigger for Mobile */}
        <button
          className="flex md:hidden items-center justify-center p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search Workspace"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications Bell Trigger */}
        <button
          className="relative flex items-center justify-center p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="View notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
        </button>

        {/* Profile Menu Trigger (Avatar Placeholder) */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
