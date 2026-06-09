"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground/90">Password reset complete</h3>
          <p className="text-[11px] text-muted-foreground leading-normal">
            Your password has been successfully updated.
          </p>
        </div>

        {/* Link back */}
        <div className="pt-2 border-t border-border/60">
          <Link
            href="/login"
            className="text-xs font-semibold text-foreground hover:underline transition-all"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="space-y-1">
        <h2 className="text-md font-semibold text-foreground/90">Reset your password</h2>
        <p className="text-[11px] text-muted-foreground">
          Enter a strong, secure new password below to update your login.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            New Password
          </label>
          <input
            id="password"
            type="password"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 cursor-pointer min-h-[32px] mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </div>
  );
}
