"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useRegister } from "@/features/auth/hooks/use-register";

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full Name is required").max(100),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric, underscores, and hyphens only"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser({
      email: data.email,
      username: data.username,
      full_name: data.fullName,
      password: data.password,
    });
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="space-y-1">
        <h2 className="text-md font-semibold text-foreground/90">Create a new account</h2>
        <p className="text-[11px] text-muted-foreground">
          Enter your details below to bootstrap your profile.
        </p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Full Name Field */}
        <div className="space-y-1">
          <label htmlFor="fullName" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            placeholder="John Doe"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.fullName.message}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-1">
          <label htmlFor="username" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Username
          </label>
          <input
            id="username"
            type="text"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
            placeholder="johndoe_123"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.username.message}</p>
          )}
        </div>

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

        {/* Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Password
          </label>
          <input
            id="password"
            type="password"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
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
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            disabled={isLoading}
            className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
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
          className="w-full flex justify-center items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 cursor-pointer min-h-[32px] mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Redirection Links */}
      <div className="pt-2 border-t border-border/60 text-center">
        <p className="text-[11px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
