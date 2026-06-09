"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useSidebarStore } from "@/stores/sidebar.store";
import { X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 1. Mobile Drawer Navigation Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative flex w-64 max-w-xs flex-col bg-sidebar shadow-2xl transition-transform duration-300">
            {/* Close Button Inside Mobile Drawer Header */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 hover:bg-sidebar-accent rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Render full Sidebar inside mobile drawer */}
            <div className="flex-1 h-full overflow-hidden">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* 2. Desktop/Tablet Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* 3. Main Display Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
