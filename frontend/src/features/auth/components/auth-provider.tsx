"use client";

import * as React from "react";
import { authService } from "../services/auth.service";
import { tokenManager } from "@/lib/auth/token-manager";
import { useAuthStore } from "@/stores/auth.store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, clearAuth, setRestoringSession } = useAuthStore();

  React.useEffect(() => {
    async function restoreSession() {
      try {
        setRestoringSession(true);
        // Silently attempt to refresh token via cookie
        const tokenData = await authService.refresh();
        tokenManager.setAccessToken(tokenData.access_token);
        
        // Fetch profile using the fresh access token
        const user = await authService.getMe();
        setAuth(user);
      } catch (error) {
        // No valid session, clear client state
        tokenManager.clear();
        clearAuth();
      } finally {
        setRestoringSession(false);
      }
    }
    restoreSession();
  }, [setAuth, clearAuth, setRestoringSession]);

  return <>{children}</>;
}
export default AuthProvider;
