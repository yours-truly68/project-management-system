"use client";

import * as React from "react";
import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";
import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useBoards } from "@/features/boards/hooks/use-boards";
import Link from "next/link";

export function Topbar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const toggleMobileOpen = useSidebarStore((state) => state.toggleMobileOpen);
 
  const pathname = usePathname();
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { activeProject, isLoading: projLoading } = useProjects();
  const { activeBoard, isLoading: boardLoading } = useBoards();
 
  const getBreadcrumbs = () => {
    // 1. Settings Routes
    if (pathname === "/settings") {
      return [{ label: "Settings", isLast: true }];
    }
    if (pathname === "/settings/workspace") {
      return [
        { label: "Settings", href: "/settings" },
        { label: "Workspace", isLast: true }
      ];
    }
    if (pathname === "/settings/members") {
      return [
        { label: "Settings", href: "/settings" },
        { label: "Members", isLast: true }
      ];
    }
    if (pathname === "/settings/danger") {
      return [
        { label: "Settings", href: "/settings" },
        { label: "Danger Zone", isLast: true }
      ];
    }
 
    // 2. Main Dashboard & Project/Board List Routes
    const wsName = wsLoading ? null : activeWorkspace?.name || "Workspace";
    const projName = projLoading ? null : activeProject?.name || "Project";
    const boardName = boardLoading ? null : activeBoard?.name || "Board";
 
    if (pathname === "/projects") {
      return [
        { label: wsName, href: "/", isLoading: wsLoading },
        { label: "Projects", isLast: true }
      ];
    }
 
    if (pathname === "/boards") {
      return [
        { label: wsName, href: "/", isLoading: wsLoading },
        { label: "Boards", isLast: true }
      ];
    }
 
    // Default: Dashboard / Board view
    return [
      { label: wsName, href: "/", isLoading: wsLoading },
      { label: projName, href: "/projects", isLoading: projLoading },
      { label: boardName, isLast: true, isLoading: boardLoading }
    ];
  };
 
  const breadcrumbs = getBreadcrumbs();

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

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium select-none" aria-label="Breadcrumb navigation">
          {breadcrumbs.map((item, idx) => {
            const showSkeleton = item.isLoading || !item.label;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-muted-foreground/30 font-normal">/</span>}
                {showSkeleton ? (
                  <div className="w-14 h-4 bg-muted animate-pulse rounded" />
                ) : item.isLast ? (
                  <span className="text-foreground font-semibold px-1 py-0.5 truncate max-w-[100px] sm:max-w-[160px]" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="hover:text-foreground rounded px-1 py-0.5 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring truncate max-w-[100px] sm:max-w-[160px]"
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
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
