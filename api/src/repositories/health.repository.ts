import { prisma } from "../utils/prisma.js";
import { logger } from "../utils/logger.js";
import { reportCriticalError } from "../services/webhook.service.js";

export const healthRepository = {
  /**
   * Check database connection by executing a simple query
   * Returns latency in milliseconds
   */
  async checkDatabase(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true, latencyMs: Date.now() - start };
    } catch (error) {
      const err = error as Error;
      const latencyMs = Date.now() - start;

      logger.error({ err, latencyMs }, "Database connection failed");

      // Report DB connection failure as critical error
      reportCriticalError(
        "error",
        `Database connection failed: ${err.message}`,
        err.stack
      );

      return { ok: false, latencyMs, error: err.message };
    }
  },
};
