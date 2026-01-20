import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

// Liste des champs sensibles à ne jamais logger
const SENSITIVE_FIELDS = [
  "password",
  "newPassword",
  "currentPassword",
  "confirmPassword",
  "token",
  "refreshToken",
  "accessToken",
  "authorization",
  "cookie",
  "secret",
];

// Fonction pour nettoyer les données sensibles avant logging
function sanitizeData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  Object.keys(sanitized).forEach((key) => {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
}

export const errorHandler = (
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  const isDevelopment = env.NODE_ENV === "development";

  // Log l'erreur avec contexte (données sensibles masquées)
  logger.error(
    {
      error: error.message,
      stack: isDevelopment ? error.stack : undefined, // Stack trace seulement en dev
      url: request.url,
      method: request.method,
      body: sanitizeData(request.body),
      params: sanitizeData(request.params),
      query: sanitizeData(request.query),
      ip: request.ip,
      userAgent: request.headers["user-agent"],
      userId: (request as any).user?.userId,
    },
    "Request error"
  );

  // Erreur de validation Zod
  if (error instanceof ZodError) {
    logger.warn(
      {
        url: request.url,
        method: request.method,
        errors: error.errors,
      },
      "Validation failed"
    );

    reply.status(400).send({
      error: "Erreur de validation",
      details: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Erreur personnalisée AppError
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.message,
      // Ne jamais envoyer le stack trace au client
    });
    return;
  }

  // Erreur Fastify avec statusCode
  if ("statusCode" in error && error.statusCode) {
    // Ne pas leak d'informations sensibles
    const safeMessage =
      error.statusCode < 500
        ? error.message
        : "Une erreur s'est produite";

    reply.status(error.statusCode).send({ error: safeMessage });
    return;
  }

  // Erreur non gérée - 500
  // JAMAIS envoyer de détails techniques en production
  reply.status(500).send({
    error: "Erreur interne du serveur",
    // En dev seulement, ajouter des infos pour debug
    ...(isDevelopment && {
      message: error.message,
      stack: error.stack,
    }),
  });
};
