"use client";

import * as React from "react";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";


interface ColumnActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}

export function ColumnActionsMenu({ onEdit, onDelete, canManage }: ColumnActionsMenuProps) {
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

  if (!canManage) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground/60 hover:text-foreground hover:bg-secondary/80 p-0.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        aria-label="Column options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-[#242B36] bg-[#1B212B] shadow-[0_20px_40px_rgba(0,0,0,0.45)] py-1 z-[9999] animate-fade-in focus:outline-none select-none">
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer font-medium"
          >
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Rename Column</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this column? All tasks in it will be permanently deleted.")) {
                onDelete();
              }
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Column</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ColumnActionsMenu;
