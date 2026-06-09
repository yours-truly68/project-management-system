"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { getErrorMessage } from "@/lib/utils";

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const register = React.useCallback(
    async (data: Record<string, string>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Register API request
        await authService.register(data);
        
        // Success: redirect to login page with success flag
        router.push("/login?registered=success");
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return { register, isLoading, error };
}
export default useRegister;
