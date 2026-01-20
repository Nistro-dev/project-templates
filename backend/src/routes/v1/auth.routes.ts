import { FastifyInstance } from "fastify";
import { authController } from "../../controllers/index.js";
import { authMiddleware } from "../../middlewares/index.js";
import {
  authRateLimiter,
  strictAuthRateLimiter,
  passwordResetRateLimiter,
} from "../../middlewares/rateLimiter.js";

export const authRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Register - limité à 5/min par IP
  fastify.post(
    "/register",
    { preHandler: [authRateLimiter] },
    authController.register
  );

  // Login - limité à 5/min par email, uniquement les échecs comptent
  fastify.post(
    "/login",
    { preHandler: [authRateLimiter] },
    authController.login
  );

  // Refresh - limité strictement
  fastify.post(
    "/refresh",
    { preHandler: [strictAuthRateLimiter] },
    authController.refresh
  );

  // Logout - pas de rate limit (déjà authentifié)
  fastify.post("/logout", authController.logout);

  // Logout all - authentifié
  fastify.post(
    "/logout-all",
    { preHandler: [authMiddleware] },
    authController.logoutAll
  );

  // Me - authentifié
  fastify.get("/me", { preHandler: [authMiddleware] }, authController.me);

  // Verify email - limité
  fastify.post(
    "/verify-email/:token",
    { preHandler: [authRateLimiter] },
    authController.verifyEmail
  );

  // Forgot password - très limité (3/heure)
  fastify.post(
    "/forgot-password",
    { preHandler: [passwordResetRateLimiter] },
    authController.forgotPassword
  );

  // Reset password - limité
  fastify.post(
    "/reset-password",
    { preHandler: [authRateLimiter] },
    authController.resetPassword
  );
};
