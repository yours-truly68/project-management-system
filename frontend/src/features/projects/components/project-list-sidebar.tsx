"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { useProjects } from "../hooks/use-projects";
import { CreateProjectModal } from "./create-project-modal";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectListSidebarProps {
  isCollapsed: boolean;
}

// Local SidebarTooltip helper
function SidebarTooltip({
  content,
  disabled,
  children,
}: {
  content: string;
  disabled?: boolean;
  children: React.ReactElement;
}) {
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

// Deterministic color selection based on project key hash
function getProjectColor(key: string): string {
  const colors = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function ProjectListSidebar({ isCollapsed }: ProjectListSidebarProps) {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const { projects, activeProjectId, setActiveProjectId, isLoading } = useProjects();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Permission check: only OWNER and ADMIN can create projects in this workspace
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const canCreate =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  if (!activeWorkspaceId) return null;

  return (
    <div className="space-y-0.5">
      {/* Header */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between px-2.5 py-1">
          <span className="text-[11px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
            Projects
          </span>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              aria-label="Create new project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        canCreate && (
          <div className="flex justify-center py-1">
            <SidebarTooltip content="Create new project">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                aria-label="Create new project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </SidebarTooltip>
          </div>
        )
      )}

      {/* Project list or loading/empty state */}
      <div className="space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-3 text-sidebar-foreground/50">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {!isCollapsed && <span className="text-xs ml-2">Loading projects...</span>}
          </div>
        ) : projects.length === 0 ? (
          !isCollapsed && (
            <div className="px-2.5 py-2 text-xs text-sidebar-foreground/45 italic">
              No projects yet.
            </div>
          )
        ) : (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;
            const projectColor = getProjectColor(project.key);

            return (
              <SidebarTooltip
                key={project.id}
                content={project.name}
                disabled={!isCollapsed}
              >
                <button
                  onClick={() => setActiveProjectId(project.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-r-md border-l-2 text-[15px] text-sidebar-foreground/70 hover:text-sidebar-foreground w-full text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent border-primary text-sidebar-foreground font-semibold"
                      : "border-transparent hover:bg-sidebar-accent/40",
                    isCollapsed && "justify-center px-0 border-l-0 rounded-md"
                  )}
                  aria-label={`Project: ${project.name}`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: projectColor }}
                  />
                  {!isCollapsed && (
                    <span className="truncate text-[15px] font-medium flex-1">
                      {project.name}
                    </span>
                  )}
                  {!isCollapsed && (
                    <span className="text-[10px] text-sidebar-foreground/35 font-bold uppercase shrink-0">
                      {project.key}
                    </span>
                  )}
                </button>
              </SidebarTooltip>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default ProjectListSidebar;
