import { FastifyInstance } from "fastify";
import { fileController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";
import { fileUploadRateLimiter } from "../../middlewares/rateLimiter.js";

export const fileRoutes = async (fastify: FastifyInstance): Promise<void> => {
  fastify.addHook("preHandler", authMiddleware);

  // Upload - rate limited (10/min)
  fastify.post(
    "/upload",
    { preHandler: [fileUploadRateLimiter] },
    fileController.upload
  );

  fastify.get("/", fileController.list);

  fastify.get("/:id/download", fileController.download);

  fastify.delete("/:id", fileController.remove);
};
