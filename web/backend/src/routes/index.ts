import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(fastify: FastifyInstance) {
  // Routes are exposed without prefix - nginx handles /api/ prefix
  await fastify.register(healthRoutes);
}
