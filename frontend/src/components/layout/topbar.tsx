"use client";

import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

export function Topbar() {
  const { isCollapsed, toggleCollapsed, toggleMobileOpen } = useSidebarStore();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 h-12 shrink-0 select-none">
      {/* Left section: Collapse Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleMobileOpen}
          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* Desktop/Tablet collapse trigger */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4.5 h-4.5" />
          ) : (
            <PanelLeftClose className="w-4.5 h-4.5" />
          )}
        </button>

        {/* Breadcrumbs placeholder */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer font-medium">Acme Workspace</span>
          <span>/</span>
          <span className="hover:text-foreground cursor-pointer font-medium">Website Redesign</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Sprint 1 Board</span>
        </nav>
      </div>

      {/* Right section: Search Trigger, Notifications, Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Compact Search Trigger */}
        <button className="flex items-center justify-center p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Bell Trigger */}
        <button className="relative flex items-center justify-center p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
        </button>

        {/* Profile Menu Trigger (Avatar Placeholder) */}
        <button className="w-6.5 h-6.5 rounded-full bg-accent hover:ring-2 hover:ring-ring border border-border flex items-center justify-center text-[10px] font-bold overflow-hidden transition-all">
          MR
        </button>
      </div>
    </header>
  );
}
