"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface ContentAreaProps {
  children: React.ReactNode;
}

export function ContentArea({ children }: ContentAreaProps) {
  const pathname = usePathname();
  const isFullWidth = pathname === "/" || pathname === "/my-work" || pathname === "/boards";

  return (
    <main className="flex-1 overflow-auto p-3 md:p-4 bg-background">
      <div
        className={
          isFullWidth
            ? "w-full min-w-0 h-full flex flex-col"
            : "mx-auto max-w-[1440px] w-full h-full flex flex-col"
        }
      >
        {children}
      </div>
    </main>
  );
}

