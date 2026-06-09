import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000/api/v1"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// For Next.js client-side compatibility, we check window/process.env safely.
const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  NODE_ENV: process.env.NODE_ENV || "development",
};

const parsedEnv = envSchema.safeParse(clientEnv);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
export type EnvConfig = z.infer<typeof envSchema>;
