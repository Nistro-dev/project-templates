import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes.js";
import { fileRoutes } from "./file.routes.js";
import { userRoutes } from "./user.routes.js";

export const registerV1Routes = async (
  fastify: FastifyInstance
): Promise<void> => {
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(fileRoutes, { prefix: "/files" });
  fastify.register(userRoutes, { prefix: "/users" });
};
