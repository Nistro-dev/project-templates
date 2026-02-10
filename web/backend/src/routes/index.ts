import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check route with /api prefix
  await fastify.register(healthRoutes, { prefix: '/api' });
}
