import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import csrf from "@fastify/csrf-protection";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { registerRoutes } from "./routes/index.js";

const fastify = Fastify({
  logger: false,
});

const start = async (): Promise<void> => {
  try {
    await fastify.register(cors, {
      origin: [env.FRONTEND_URL],
      credentials: true,
    });

    await fastify.register(helmet, {
      contentSecurityPolicy: false,
    });

    await fastify.register(cookie, {
      secret: env.COOKIE_SECRET,
    });

    await fastify.register(csrf, {
      cookieOpts: { signed: true },
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    });

    // Rate limiting global
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      cache: 10000,
      allowList: [],
      redis: undefined, // Utiliser Redis pour production si disponible
      skipOnError: false,
      nameSpace: "global-",
      continueExceeding: false,
      enableDraftSpec: true,
    });

    fastify.setErrorHandler(errorHandler);

    fastify.get("/health", async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });

    await registerRoutes(fastify);

    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });

    logger.info(`Server running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
};

const shutdown = async (): Promise<void> => {
  logger.info("Shutting down server...");
  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
