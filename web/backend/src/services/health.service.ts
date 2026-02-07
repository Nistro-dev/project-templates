import { healthRepository } from "../repositories/health.repository.js";

export interface HealthCheck {
  name: string;
  status: "ok" | "error";
  latencyMs?: number;
  error?: string;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: HealthCheck[];
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
      checks: [
        {
          name: "database",
          status: dbCheck.ok ? "ok" : "error",
          latencyMs: dbCheck.latencyMs,
        },
      ],
    };
  },
};
