"use client";

import * as React from "react";
import { ChevronDown, Columns } from "lucide-react";
import { Column } from "@/features/columns/types/column.types";

interface ColumnNavigatorProps {
  columns: Column[];
  columnRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
}

export function ColumnNavigator({ columns, columnRefs }: ColumnNavigatorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (columns.length === 0) return null;

  const handleNavigate = (columnId: string) => {
    const el = columnRefs.current?.[columnId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-card-hover text-xs font-semibold transition-all cursor-pointer animate-fade-in select-none"
        aria-label="Navigate to column"
      >
        <Columns className="w-3.5 h-3.5 text-muted-foreground" />
        <span>Columns</span>
        <ChevronDown
          className="w-3 h-3 text-muted-foreground/60 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-lg border border-border bg-elevated shadow-2xl py-1 z-[9999] max-h-64 overflow-y-auto animate-fade-in focus:outline-none select-none">
          <div className="px-3 py-1.5 border-b border-border mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
              Jump to Stage
            </span>
          </div>
          {[...columns]
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <button
                key={column.id}
                onClick={() => {
                  handleNavigate(column.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-background/80 transition-colors text-left cursor-pointer font-medium"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: column.color || "#3B82F6" }}
                />
                <span className="truncate flex-1">{column.name}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default ColumnNavigator;
