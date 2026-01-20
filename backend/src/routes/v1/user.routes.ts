import { FastifyInstance } from "fastify";
import * as userController from "../../controllers/user.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

export const userRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get(
    "/profile",
    { preHandler: [authMiddleware] },
    userController.getProfile
  );

  fastify.patch(
    "/profile",
    { preHandler: [authMiddleware] },
    userController.updateProfile
  );

  fastify.patch(
    "/password",
    { preHandler: [authMiddleware] },
    userController.changePassword
  );
};
