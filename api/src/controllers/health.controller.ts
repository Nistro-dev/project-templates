import { FastifyRequest, FastifyReply } from "fastify";
import { healthService } from "../services/health.service.js";

export const healthController = {
  /**
   * GET /health
   * Returns the health status of the application
   */
  async getHealth(_request: FastifyRequest, reply: FastifyReply) {
    const health = await healthService.getHealthStatus();

    const statusCode = health.status === "healthy" ? 200 : 503;

    return reply.status(statusCode).send(health);
  },
};
