import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
