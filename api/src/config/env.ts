import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  DATABASE_URL: z.string(),

  // CORS - Comma-separated list of allowed origins, or "*" for public API
  CORS_ORIGINS: z.string().default("*"),

  // Project identification (for logging)
  PROJECT_ID: z.string().optional(),
  PROJECT_NAME: z.string().default("unknown"),

  // Critical logs webhook (optional)
  LOG_WEBHOOK_URL: z.string().optional(),
  LOG_WEBHOOK_SECRET: z.string().optional(),
  LOG_DEDUP_MINUTES: z.string().transform(Number).default("5"),
});

export const env = envSchema.parse(process.env);

/**
 * Parse CORS_ORIGINS into an array of origins or true for "*"
 */
export function getCorsOrigins(): string[] | true {
  if (env.CORS_ORIGINS === "*") {
    return true; // Allow all origins
  }
  return env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
}
