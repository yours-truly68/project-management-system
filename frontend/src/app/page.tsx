import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6 py-12">
      <main className="flex flex-col items-center justify-center max-w-xl text-center space-y-6">
        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-lg">A</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Antigravity</h1>
          <p className="text-sm text-muted-foreground">
            Kanban Project Management System (Frontend Foundation Running)
          </p>
        </div>
        <div className="p-4 rounded-md border border-border bg-card max-w-md text-xs text-left font-mono space-y-2">
          <div className="text-secondary-foreground font-semibold">✓ Systems initialized:</div>
          <div className="text-muted-foreground">- Axios Client with token refresh interceptors</div>
          <div className="text-muted-foreground">- TanStack Query Client configuration</div>
          <div className="text-muted-foreground">- System & Dark/Light mode theme system</div>
          <div className="text-muted-foreground">- Centralized validated environment configs</div>
        </div>
      </main>
    </div>
  );
}
