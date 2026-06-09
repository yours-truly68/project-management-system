"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/use-login";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isRegisteredSuccess = searchParams.get("registered") === "success";

  const { login, isLoading, error } = useLogin();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="space-y-1">
        <h2 className="text-md font-semibold text-foreground/90">Sign in to your account</h2>
        <p className="text-[11px] text-muted-foreground">
          Welcome back! Enter your details to continue.
        </p>
      </div>

      {/* Success Notification Banner */}
      {isRegisteredSuccess && (
        <div className="p-2.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold leading-normal">
          Registration successful! Please sign in.
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            placeholder="name@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground/85 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full text-xs px-2.5 py-1.5 pr-8 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
              placeholder="••••••••"
              {...register("password")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 cursor-pointer min-h-[32px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Redirection Links */}
      <div className="pt-2 border-t border-border/60 text-center">
        <p className="text-[11px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground hover:underline transition-all"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
