import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  // Zod validation errors
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

  // Log unexpected errors
  logger.error(error, "Unhandled error");

  // Don't expose internal errors in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : error.message;

  return reply.status(error.statusCode || 500).send({
    error: "Internal Server Error",
    message,
  });
}
