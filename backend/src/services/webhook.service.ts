import crypto from "crypto";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

interface RequestInfo {
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
}

interface CriticalLogPayload {
  projectId: string | undefined;
  projectName: string;
  environment: string;
  level: "error" | "fatal";
  message: string;
  stack?: string;
  errorHash: string;
  occurrences: number;
  request?: RequestInfo;
  timestamp: string;
  serverUptime: number;
  nodeVersion: string;
}

// Store for deduplication: hash -> { count, lastSent }
const errorCache = new Map<string, { count: number; lastSent: Date }>();

// Server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * Generate a hash for an error to deduplicate
 */
function generateErrorHash(message: string, stack?: string): string {
  const content = `${message}::${stack || ""}`;
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Check if we should send this error (deduplication)
 */
function shouldSendError(hash: string): { shouldSend: boolean; occurrences: number } {
  const cached = errorCache.get(hash);
  const now = new Date();
  const dedupMinutes = env.LOG_DEDUP_MINUTES;

  if (!cached) {
    errorCache.set(hash, { count: 1, lastSent: now });
    return { shouldSend: true, occurrences: 1 };
  }

  const minutesSinceLastSent = (now.getTime() - cached.lastSent.getTime()) / 1000 / 60;

  if (minutesSinceLastSent >= dedupMinutes) {
    const occurrences = cached.count;
    errorCache.set(hash, { count: 1, lastSent: now });
    return { shouldSend: true, occurrences };
  }

  // Increment count but don't send
  cached.count++;
  return { shouldSend: false, occurrences: cached.count };
}

/**
 * Send critical log to webhook
 */
async function sendWebhook(payload: CriticalLogPayload, retries = 3): Promise<boolean> {
  if (!env.LOG_WEBHOOK_URL) {
    return false;
  }

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add signature if secret is configured
  if (env.LOG_WEBHOOK_SECRET) {
    headers["X-Webhook-Signature"] = generateSignature(body, env.LOG_WEBHOOK_SECRET);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(env.LOG_WEBHOOK_URL, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (response.ok) {
        logger.debug({ attempt }, "Webhook sent successfully");
        return true;
      }

      logger.warn(
        { attempt, status: response.status },
        "Webhook failed, retrying..."
      );
    } catch (error) {
      logger.warn({ attempt, error }, "Webhook request failed, retrying...");
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  logger.error("Webhook failed after all retries");
  return false;
}

/**
 * Report a critical error to the webhook
 */
export async function reportCriticalError(
  level: "error" | "fatal",
  message: string,
  stack?: string,
  request?: RequestInfo
): Promise<void> {
  const hash = generateErrorHash(message, stack);
  const { shouldSend, occurrences } = shouldSendError(hash);

  if (!shouldSend) {
    logger.debug({ hash, occurrences }, "Error deduplicated, not sending webhook");
    return;
  }

  const payload: CriticalLogPayload = {
    projectId: env.PROJECT_ID,
    projectName: env.PROJECT_NAME,
    environment: env.NODE_ENV,
    level,
    message,
    stack,
    errorHash: hash,
    occurrences,
    request,
    timestamp: new Date().toISOString(),
    serverUptime: Math.floor((Date.now() - serverStartTime) / 1000),
    nodeVersion: process.version,
  };

  // Send webhook in background (don't block)
  sendWebhook(payload).catch((err) => {
    logger.error({ err }, "Failed to send critical error webhook");
  });
}

/**
 * Clean up old entries from error cache (run periodically)
 */
export function cleanupErrorCache(): void {
  const now = new Date();
  const maxAge = env.LOG_DEDUP_MINUTES * 60 * 1000 * 2; // 2x dedup time

  for (const [hash, data] of errorCache.entries()) {
    if (now.getTime() - data.lastSent.getTime() > maxAge) {
      errorCache.delete(hash);
    }
  }
}

// Cleanup cache every 10 minutes
setInterval(cleanupErrorCache, 10 * 60 * 1000);
