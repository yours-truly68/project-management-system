"use client";

import * as React from "react";
import { useSidebarStore } from "@/stores/sidebar.store";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Plus,
  FolderPlus,
  LayoutGrid,
} from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";
import { usePathname } from "next/navigation";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useBoards } from "@/features/boards/hooks/use-boards";
import Link from "next/link";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateBoardModal } from "@/features/boards/components/create-board-modal";

interface BreadcrumbItem {
  label: string | null;
  href?: string;
  isLast?: boolean;
  isLoading?: boolean;
}

export function Topbar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const toggleMobileOpen = useSidebarStore((state) => state.toggleMobileOpen);
 
  const pathname = usePathname();
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { activeProject, isLoading: projLoading } = useProjects();
  const { activeBoard, isLoading: boardLoading } = useBoards();

  // Modals state
  const [isProjectOpen, setIsProjectOpen] = React.useState(false);
  const [isBoardOpen, setIsBoardOpen] = React.useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionDropdownOpen(false);
      }
    }
    if (isActionDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isActionDropdownOpen]);
 
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (pathname === "/my-work") {
      return [{ label: "My Work", isLast: true }];
    }
    if (pathname === "/notifications") {
      return [{ label: "Notifications", isLast: true }];
    }

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
 
    // If no board is active but project is, breadcrumbs should represent Dashboard or Project
    if (!activeBoard) {
      return [
        { label: wsName, href: "/", isLoading: wsLoading },
        { label: projName, isLast: true, isLoading: projLoading }
      ];
    }

    return [
      { label: wsName, href: "/", isLoading: wsLoading },
      { label: projName, href: "/projects", isLoading: projLoading },
      { label: boardName, isLast: true, isLoading: boardLoading }
    ];
  };
 
  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-5 h-14 shrink-0 select-none z-30">
      {/* Left section: Collapse Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobileOpen}
          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground md:hidden transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>

        <button
          onClick={toggleCollapsed}
          className="hidden md:flex p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand sidebar panel" : "Collapse sidebar panel"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-[18px] h-[18px]" />
          ) : (
            <PanelLeftClose className="w-[18px] h-[18px]" />
          )}
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium select-none truncate" aria-label="Breadcrumb navigation">
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
                    className="hover:text-foreground rounded px-1 py-0.5 hover:bg-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring truncate max-w-[100px] sm:max-w-[160px]"
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Middle/Right section: Search, Actions, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Command-Search Bar */}
        <button
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary hover:border-muted-foreground/20 transition-all text-left text-xs text-muted-foreground w-44 lg:w-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          aria-label="Search Workspace"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          <span className="flex-1 truncate">Search workspace...</span>
          <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[9px] font-medium text-muted-foreground/80 shrink-0">
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

        {/* Quick Actions Plus Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
            className="flex items-center justify-center p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label="Quick action menu"
          >
            <Plus className="w-4 h-4" />
          </button>

          {isActionDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-dropdown border border-border/60 bg-elevated shadow-2xl py-1 z-[var(--z-dropdown)] origin-top-right animate-scale-in text-left select-none">
              <button
                onClick={() => {
                  setIsProjectOpen(true);
                  setIsActionDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 h-[var(--height-dropdown-item)] text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer font-medium"
              >
                <FolderPlus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>New Project</span>
              </button>
              {activeProject && (
                <button
                  onClick={() => {
                    setIsBoardOpen(true);
                    setIsActionDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 h-[var(--height-dropdown-item)] text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer font-medium"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>New Board</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <button
          className="relative flex items-center justify-center p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
        </button>

        {/* Profile Menu Dropdown */}
        <ProfileDropdown />
      </div>

      {/* Action Modals */}
      {isProjectOpen && (
        <CreateProjectModal isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} />
      )}
      {isBoardOpen && activeProject && (
        <CreateBoardModal
          isOpen={isBoardOpen}
          onClose={() => setIsBoardOpen(false)}
          projectId={activeProject.id}
        />
      )}
    </header>
  );
}
