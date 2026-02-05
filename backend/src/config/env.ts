import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  DATABASE_URL: z.string(),

  FRONTEND_URL: z.string().default("http://localhost"),

  // Project identification (for logging)
  PROJECT_ID: z.string().optional(),
  PROJECT_NAME: z.string().default("unknown"),

  // Critical logs webhook (optional)
  LOG_WEBHOOK_URL: z.string().optional(),
  LOG_WEBHOOK_SECRET: z.string().optional(),
  LOG_DEDUP_MINUTES: z.string().transform(Number).default("5"),
});

export const env = envSchema.parse(process.env);
