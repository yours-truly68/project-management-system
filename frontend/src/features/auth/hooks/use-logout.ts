"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { tokenManager } from "@/lib/auth/token-manager";
import { useAuthStore } from "@/stores/auth.store";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoading, setIsLoading] = React.useState(false);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if server request fails
    } finally {
      tokenManager.clear();
      clearAuth();
      setIsLoading(false);
      router.push("/login");
    }
  }, [router, clearAuth]);

  return { logout, isLoading };
}
export default useLogout;
