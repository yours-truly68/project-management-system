"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

interface ViewSwitcherProps {
  currentView: "board" | "list";
  onViewChange: (view: "board" | "list") => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center bg-accent/50 rounded-lg p-0.5 border border-border select-none shrink-0">
      <button
        onClick={() => onViewChange("board")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
          currentView === "board"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Board</span>
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
          currentView === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="w-3.5 h-3.5" />
        <span>List</span>
      </button>
    </div>
  );
}

export default ViewSwitcher;
