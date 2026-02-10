import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check route (no /api prefix)
  await fastify.register(healthRoutes);
}
