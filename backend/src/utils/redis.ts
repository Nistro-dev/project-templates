import Redis from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    logger.error({ error: err.message }, "Redis connection error");
    return true;
  },
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error({ error: err.message }, "Redis error");
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

// Fonctions utilitaires pour les refresh tokens
const REFRESH_TOKEN_PREFIX = "refresh_token:";
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 jours en secondes

export const storeRefreshToken = async (
  token: string,
  userId: string,
  expiresAt: Date
): Promise<void> => {
  const key = `${REFRESH_TOKEN_PREFIX}${token}`;
  const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

  await redis.setex(key, ttl, userId);
};

export const getRefreshToken = async (
  token: string
): Promise<string | null> => {
  const key = `${REFRESH_TOKEN_PREFIX}${token}`;
  return redis.get(key);
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  const key = `${REFRESH_TOKEN_PREFIX}${token}`;
  await redis.del(key);
};

export const deleteAllUserRefreshTokens = async (
  userId: string
): Promise<void> => {
  // Scanner tous les tokens pour trouver ceux de cet utilisateur
  const stream = redis.scanStream({
    match: `${REFRESH_TOKEN_PREFIX}*`,
    count: 100,
  });

  const tokensToDelete: string[] = [];

  stream.on("data", async (keys: string[]) => {
    for (const key of keys) {
      const storedUserId = await redis.get(key);
      if (storedUserId === userId) {
        tokensToDelete.push(key);
      }
    }
  });

  stream.on("end", async () => {
    if (tokensToDelete.length > 0) {
      await redis.del(...tokensToDelete);
    }
  });
};
