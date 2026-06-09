"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query";
import { AuthProvider } from "@/features/auth/components/auth-provider";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // getQueryClient returns browserQueryClient on browser, or a new client on server.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
export default AppProvider;
