import Fastify from "fastify";
import crypto from "crypto";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env, getCorsOrigins } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { reportCriticalError } from "./services/webhook.service.js";

const fastify = Fastify({
  logger: false, // We use pino directly
  trustProxy: true, // Trust reverse proxy (nginx)
  genReqId: () => crypto.randomUUID(), // Generate unique request IDs
});

async function start() {
  try {
    // ============================
    // REQUEST LOGGING
    // ============================
    fastify.addHook("onRequest", async (request) => {
      request.log = logger.child({
        requestId: request.id,
        method: request.method,
        url: request.url,
        ip: request.ip,
      }) as any;
      request.log.info("Request started");
    });

    fastify.addHook("onResponse", async (request, reply) => {
      request.log.info(
        {
          statusCode: reply.statusCode,
          responseTime: reply.elapsedTime,
        },
        "Request completed"
      );
    });

    // ============================
    // SECURITY PLUGINS
    // ============================

    // CORS - Configurable origins
    const corsOrigins = getCorsOrigins();
    await fastify.register(cors, {
      origin: corsOrigins,
      credentials: corsOrigins !== true, // Only allow credentials for specific origins
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    });

    // Helmet - Security headers
    await fastify.register(helmet, {
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      // Strict Transport Security (HSTS)
      strictTransportSecurity: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // X-Frame-Options
      frameguard: { action: "deny" },
      // Referrer Policy
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // Cross-Origin-Embedder-Policy
      crossOriginEmbedderPolicy: false, // Can cause issues with external resources
      // Cross-Origin-Opener-Policy
      crossOriginOpenerPolicy: { policy: "same-origin" },
      // Cross-Origin-Resource-Policy
      crossOriginResourcePolicy: { policy: "same-origin" },
      // DNS Prefetch Control
      dnsPrefetchControl: { allow: false },
      // Hide X-Powered-By
      hidePoweredBy: true,
      // IE No Open
      ieNoOpen: true,
      // No Sniff
      noSniff: true,
      // Origin Agent Cluster
      originAgentCluster: true,
      // Permitted Cross-Domain-Policies
      permittedCrossDomainPolicies: { permittedPolicies: "none" },
    });

    // ============================
    // ADDITIONAL SECURITY MEASURES
    // ============================

    // Add security headers manually for extra protection
    fastify.addHook("onSend", async (_request, reply, _payload) => {
      // Permissions Policy (formerly Feature-Policy)
      reply.header(
        "Permissions-Policy",
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
      );
      // Cache Control for sensitive endpoints
      reply.header("Cache-Control", "no-store, no-cache, must-revalidate");
      reply.header("Pragma", "no-cache");
      reply.header("Expires", "0");
    });

    // Request validation - reject suspicious requests
    fastify.addHook("onRequest", async (request, reply) => {
      // Block requests with suspicious user agents
      const userAgent = request.headers["user-agent"] || "";
      const suspiciousPatterns = [
        /sqlmap/i,
        /nikto/i,
        /nmap/i,
        /masscan/i,
        /zgrab/i,
      ];

      if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
        logger.warn({ userAgent }, "Blocked suspicious user agent");
        return reply.status(403).send({ error: "Forbidden" });
      }

      // Validate Content-Type for POST/PUT/PATCH requests
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        const contentType = request.headers["content-type"];
        if (contentType && !contentType.includes("application/json")) {
          // Allow multipart for file uploads if needed in the future
          if (!contentType.includes("multipart/form-data")) {
            return reply.status(415).send({ error: "Unsupported Media Type" });
          }
        }
      }
    });

    // ============================
    // ERROR HANDLER
    // ============================
    fastify.setErrorHandler(errorHandler);

    // ============================
    // ROUTES
    // ============================
    await registerRoutes(fastify);

    // ============================
    // START SERVER
    // ============================
    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
    logger.info(`Server running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Project: ${env.PROJECT_NAME}`);
    const corsDisplay = corsOrigins === true ? "*" : corsOrigins.join(", ");
    logger.info(`CORS origins: ${corsDisplay}`);
    if (env.LOG_WEBHOOK_URL) {
      logger.info("Critical error webhook enabled");
    }
  } catch (error) {
    const err = error as Error;
    logger.fatal(err, "Failed to start server");

    // Report fatal startup error
    await reportCriticalError("fatal", err.message, err.stack);

    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    logger.info("Server closed");
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    logger.error(err, "Error during shutdown");
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.fatal(error, "Uncaught exception");
  await reportCriticalError("fatal", error.message, error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.fatal(error, "Unhandled rejection");
  await reportCriticalError("fatal", error.message, error.stack);
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
