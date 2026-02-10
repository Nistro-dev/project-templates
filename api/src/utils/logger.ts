import pino from "pino";
import { env } from "../config/env.js";

// Create base logger
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: {
    project: env.PROJECT_NAME,
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport:
    env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Create child logger with request context
export function createRequestLogger(requestId: string, method: string, url: string) {
  return logger.child({
    requestId,
    method,
    url,
  });
}
