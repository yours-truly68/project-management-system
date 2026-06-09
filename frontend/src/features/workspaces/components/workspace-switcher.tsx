"use client";

import * as React from "react";
import { useWorkspaces } from "../hooks/use-workspaces";
import { CreateWorkspaceModal } from "./create-workspace-modal";
import { ChevronDown, Plus, Settings } from "lucide-react";
import Link from "next/link";

interface WorkspaceSwitcherProps {
  isCollapsed: boolean;
}

export function WorkspaceSwitcher({ isCollapsed }: WorkspaceSwitcherProps) {
  const { workspaces, activeWorkspace, setActiveWorkspaceId, isLoading } = useWorkspaces();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const initials = activeWorkspace
    ? activeWorkspace.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "K";

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-8 text-[11px] text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative w-full animate-fade-in" ref={dropdownRef}>
      {!isCollapsed ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 overflow-hidden w-full text-left rounded p-1 hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          aria-label={`Workspace Switcher, current workspace: ${activeWorkspace?.name || "KanDo Workspace"}`}
          aria-expanded={isOpen}
        >
          <div className="w-6 h-6 rounded bg-sidebar-accent flex items-center justify-center text-sm font-bold shrink-0 text-foreground">
            {initials}
          </div>
          <span className="font-bold text-[15px] truncate text-foreground">
            {activeWorkspace?.name || "Select Workspace"}
          </span>
          <ChevronDown className="w-4 h-4 ml-auto text-sidebar-foreground/60 shrink-0" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded bg-sidebar-accent flex items-center justify-center text-sm font-bold mx-auto hover:bg-sidebar-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
          aria-label={`Workspace Switcher, current workspace: ${activeWorkspace?.name || "KanDo Workspace"}`}
          aria-expanded={isOpen}
        >
          {initials}
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg py-1.5 z-50 animate-fade-in focus:outline-none select-none">
          <div className="px-3 py-1.5 border-b border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Workspaces
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {workspaces.map((ws) => {
              const wsInitials = ws.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const isActive = ws.id === activeWorkspace?.id;

              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <div className="w-5 h-5 rounded bg-sidebar-accent border border-border/40 flex items-center justify-center text-[10px] font-bold shrink-0 text-foreground">
                    {wsInitials}
                  </div>
                  <span className="truncate flex-1">{ws.name}</span>
                </button>
              );
            })}

            {workspaces.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No workspaces found
              </div>
            )}
          </div>

          <div className="border-t border-border pt-1.5 mt-1 pb-0.5 space-y-0.5">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Create Workspace</span>
            </button>

            {activeWorkspace && (
              <Link
                href="/settings/workspace"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Workspace Settings</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
export default WorkspaceSwitcher;
