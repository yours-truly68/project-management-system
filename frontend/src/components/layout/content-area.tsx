import * as React from "react";

interface ContentAreaProps {
  children: React.ReactNode;
}

export function ContentArea({ children }: ContentAreaProps) {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
      <div className="mx-auto max-w-7xl h-full flex flex-col">
        {children}
      </div>
    </main>
  );
}
