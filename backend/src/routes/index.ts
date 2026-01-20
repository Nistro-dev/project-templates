import { FastifyInstance } from "fastify";
import { registerV1Routes } from "./v1/index.js";

export const registerRoutes = async (
  fastify: FastifyInstance
): Promise<void> => {
  fastify.register(registerV1Routes, { prefix: "/api/v1" });
};
