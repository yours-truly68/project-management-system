"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ContentArea } from "./content-area";
import { useSidebarStore } from "@/stores/sidebar.store";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useActiveStateSync } from "@/features/workspaces/hooks/use-active-state-sync";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  useActiveStateSync();
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const timer = setTimeout(() => {
      setMounted(true);
      setIsMobile(mql.matches);
    }, 0);
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    mql.addEventListener("change", onChange);
    return () => {
      clearTimeout(timer);
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 
        Hydration-safe dynamic layout:
        During SSR and before hydration, we mount the desktop sidebar (hidden on mobile via CSS).
        After mounting on mobile viewports, we unmount it and use the shadcn Sheet to prevent double-mounting.
      */}
      {(!mounted || !isMobile) && (
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar />
        </div>
      )}

      {mounted && isMobile && (
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Sidebar</SheetTitle>
            <SheetDescription className="sr-only">
              Workspace links, projects, and boards navigation.
            </SheetDescription>
            <div className="h-full overflow-hidden">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Main Display Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
}

