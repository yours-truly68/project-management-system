"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { useBoardStore } from "@/stores/board.store";
import { useFavorites } from "../hooks/use-favorites";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoriteListSidebarProps {
  isCollapsed: boolean;
}

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

export function FavoriteListSidebar({ isCollapsed }: FavoriteListSidebarProps) {
  const router = useRouter();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { setActiveProjectId } = useProjectStore();
  const { setActiveBoardId } = useBoardStore();
  const { data: favorites = [], isLoading } = useFavorites();

  if (!activeWorkspaceId) return null;

  // Filter favorites by the current active workspace
  const activeFavorites = favorites.filter((fav) => {
    if (fav.entity_type === "project" && fav.project) {
      return fav.project.workspace_id === activeWorkspaceId;
    }
    if (fav.entity_type === "board" && fav.project) {
      return fav.project.workspace_id === activeWorkspaceId;
    }
    return false;
  });

  const handleFavoriteClick = (fav: typeof favorites[0]) => {
    if (fav.entity_type === "project" && fav.project) {
      setActiveProjectId(fav.project.id);
      setActiveBoardId(null);
      router.push("/boards");
    } else if (fav.entity_type === "board" && fav.board && fav.project) {
      setActiveProjectId(fav.project.id);
      setActiveBoardId(fav.board.id);
      router.push("/");
    }
  };

  return (
    <div className="space-y-0.5">
      {/* Header */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between px-2.5 py-1">
          <span className="text-[11px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
            Favorites
          </span>
        </div>
      ) : (
        <div className="border-t border-sidebar-border/30 my-1" />
      )}

      {/* Favorites List */}
      <div className="space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-2 text-sidebar-foreground/50">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            {!isCollapsed && <span className="text-xs ml-2">Loading...</span>}
          </div>
        ) : activeFavorites.length === 0 ? (
          !isCollapsed && (
            <div className="px-2.5 py-1.5 text-xs text-sidebar-foreground/45 italic">
              No favorites yet.
            </div>
          )
        ) : (
          activeFavorites.map((fav) => {
            const name = fav.entity_type === "project" ? fav.project?.name : fav.board?.name;
            if (!name) return null;

            return (
              <SidebarTooltip
                key={fav.id}
                content={`${fav.entity_type === "project" ? "Project" : "Board"}: ${name}`}
                disabled={!isCollapsed}
              >
                <button
                  onClick={() => handleFavoriteClick(fav)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[15px] text-sidebar-foreground/70 hover:text-sidebar-foreground w-full text-left transition-all hover:bg-sidebar-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                    isCollapsed && "justify-center px-0 rounded-md"
                  )}
                  aria-label={`Favorite: ${name}`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate text-[15px] font-medium flex-1">
                      {name}
                    </span>
                  )}
                </button>
              </SidebarTooltip>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FavoriteListSidebar;
