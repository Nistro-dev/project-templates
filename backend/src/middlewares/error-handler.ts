import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { reportCriticalError } from "../services/webhook.service.js";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Zod validation errors (400 - not critical)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Validation Error",
      message: "Invalid request data",
      details: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const statusCode = error.statusCode || 500;

  // Log the error
  logger.error(
    {
      err: error,
      statusCode,
      method: request.method,
      url: request.url,
      ip: request.ip,
    },
    "Unhandled error"
  );

  // Report critical errors (500+) to webhook
  if (statusCode >= 500) {
    reportCriticalError("error", error.message, error.stack, {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers["user-agent"],
    });
  }

  // Don't expose internal errors in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : error.message;

  return reply.status(statusCode).send({
    error: "Internal Server Error",
    message,
  });
}
