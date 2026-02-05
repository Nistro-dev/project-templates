import { prisma } from "../utils/prisma.js";

export const healthRepository = {
  /**
   * Check database connection by executing a simple query
   * Returns latency in milliseconds
   */
  async checkDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true, latencyMs: Date.now() - start };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  },
};
