import { FastifyRequest, FastifyReply } from "fastify";
import { TooManyRequestsError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// En-memory store (utiliser Redis en production)
const store: RateLimitStore = {};

// Nettoyage périodique du store
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Nettoyage toutes les minutes

interface RateLimitOptions {
  max: number;
  windowMs: number;
  keyGenerator?: (request: FastifyRequest) => string;
  skipSuccessfulRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    max,
    windowMs,
    keyGenerator = (request) => request.ip,
    skipSuccessfulRequests = false,
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const key = keyGenerator(request);
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    store[key].count++;

    const remaining = Math.max(0, max - store[key].count);
    const resetTime = new Date(store[key].resetTime);

    // Headers de rate limiting
    reply.header("X-RateLimit-Limit", max);
    reply.header("X-RateLimit-Remaining", remaining);
    reply.header("X-RateLimit-Reset", resetTime.toISOString());

    if (store[key].count > max) {
      logger.warn(
        {
          ip: request.ip,
          url: request.url,
          count: store[key].count,
        },
        "Rate limit exceeded"
      );

      throw new TooManyRequestsError(
        `Trop de tentatives. Veuillez réessayer dans ${Math.ceil(
          (store[key].resetTime - now) / 1000
        )} secondes`
      );
    }

    // Si skipSuccessfulRequests, décrémenter en cas de succès
    // Note: Ne peut pas utiliser addHook sur reply, à implémenter différemment si nécessaire
  };
};

// Rate limiters préconfigurés
export const authRateLimiter = createRateLimiter({
  max: 5, // 5 tentatives
  windowMs: 60 * 1000, // par minute
  keyGenerator: (request) => {
    // Utiliser l'email si disponible, sinon l'IP
    const body = request.body as { email?: string } | undefined;
    return body?.email || request.ip;
  },
  skipSuccessfulRequests: true, // Ne compter que les échecs
});

export const strictAuthRateLimiter = createRateLimiter({
  max: 3, // 3 tentatives seulement
  windowMs: 5 * 60 * 1000, // sur 5 minutes
  keyGenerator: (request) => {
    const body = request.body as { email?: string } | undefined;
    return body?.email || request.ip;
  },
});

export const fileUploadRateLimiter = createRateLimiter({
  max: 10, // 10 uploads
  windowMs: 60 * 1000, // par minute
  keyGenerator: (request) => request.user?.userId || request.ip,
});

export const passwordResetRateLimiter = createRateLimiter({
  max: 3, // 3 demandes
  windowMs: 60 * 60 * 1000, // par heure
  keyGenerator: (request) => {
    const body = request.body as { email?: string } | undefined;
    return body?.email || request.ip;
  },
});
