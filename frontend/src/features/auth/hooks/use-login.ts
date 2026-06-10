"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { tokenManager } from "@/lib/auth/token-manager";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/lib/utils";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = React.useCallback(
    async (data: Record<string, string>) => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Call login endpoint (returns access_token only)
        const response = await authService.login(data);
        tokenManager.setAccessToken(response.tokens.access_token);

        // 2. Hydrate Zustand auth store with user from response
        setAuth(response.user);

        // 4. Redirect user to Dashboard root
        router.push("/");
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        tokenManager.clear();
      } finally {
        setIsLoading(false);
      }
    },
    [router, setAuth]
  );

  return { login, isLoading, error };
}
export default useLogin;
