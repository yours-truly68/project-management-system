"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Sun, Moon, Monitor, Settings, LogOut } from "lucide-react";

export function ProfileDropdown() {
  const { user } = useAuthStore();
  const { logout, isLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "MR";

  return (
    <div className="relative" ref={containerRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 rounded-full bg-accent hover:ring-2 hover:ring-ring border border-border flex items-center justify-center text-xs font-bold overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        aria-label="Open user profile settings menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {/* Dropdown Menu Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-elevated shadow-lg py-1 z-50 animate-fade-in focus:outline-none select-none">
          {/* User Profile info header */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.full_name || "User Profile"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {user?.email || "user@example.com"}
            </p>
          </div>

          {/* Links Section */}
          <div className="py-1 border-b border-border">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Mini Theme Switcher Section */}
          {mounted && (
            <div className="px-3 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Theme</span>
              <div className="flex bg-secondary rounded p-0.5 gap-0.5 border border-border/40">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-1 rounded cursor-pointer transition-colors focus-visible:outline-none ${
                    theme === "light"
                      ? "bg-card text-foreground shadow-sm border border-border/10"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                  title="Light Theme"
                  aria-label="Switch to Light Theme"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-1 rounded cursor-pointer transition-colors focus-visible:outline-none ${
                    theme === "dark"
                      ? "bg-card text-foreground shadow-sm border border-border/10"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                  title="Dark Theme"
                  aria-label="Switch to Dark Theme"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`p-1 rounded cursor-pointer transition-colors focus-visible:outline-none ${
                    theme === "system"
                      ? "bg-card text-foreground shadow-sm border border-border/10"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                  title="System Theme"
                  aria-label="Switch to System Theme"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Destructive Actions Section */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoading ? "Logging out..." : "Log out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
