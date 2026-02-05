import { healthRepository } from "../repositories/health.repository.js";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: "up" | "down";
      latencyMs: number;
    };
  };
}

const startTime = Date.now();

export const healthService = {
  /**
   * Get comprehensive health status of the application
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const dbCheck = await healthRepository.checkDatabase();

    const status = dbCheck.ok ? "healthy" : "unhealthy";

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks: {
        database: {
          status: dbCheck.ok ? "up" : "down",
          latencyMs: dbCheck.latencyMs,
        },
      },
    };
  },
};
