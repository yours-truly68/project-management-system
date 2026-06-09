"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MailCheck } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
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
          <MailCheck className="w-5 h-5" />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground/90">Check your inbox</h3>
          <p className="text-[11px] text-muted-foreground leading-normal">
            If an account exists for that email, we sent password reset instructions.
          </p>
        </div>

        {/* Link back */}
        <div className="pt-2 border-t border-border/60">
          <Link
            href="/login"
            className="text-xs font-semibold text-foreground hover:underline transition-all"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="space-y-1">
        <h2 className="text-md font-semibold text-foreground/90">Forgot password?</h2>
        <p className="text-[11px] text-muted-foreground">
          Enter your email and we will send you instructions to reset your password.
        </p>
      </div>

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
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            placeholder="name@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 cursor-pointer min-h-[32px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending instructions...</span>
            </>
          ) : (
            <span>Send Instructions</span>
          )}
        </button>
      </form>

      {/* Redirection Links */}
      <div className="pt-2 border-t border-border/60 text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
