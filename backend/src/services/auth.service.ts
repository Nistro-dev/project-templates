import { prisma } from "../utils/prisma.js";
import crypto from "crypto";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  logger,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "../utils/index.js";
import {
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
} from "../utils/redis.js";
import type { RegisterInput, LoginInput } from "../schemas/index.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service.js";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const register = async (
  data: RegisterInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Cet email est déjà enregistré");
  }

  const hashedPassword = await hashPassword(data.password);
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      emailVerificationToken,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  // Envoyer l'email de vérification
  await sendVerificationEmail(user.email, emailVerificationToken);

  const tokens = await generateTokens(user.id, user.email);

  logger.info({ userId: user.id }, "User registered");

  return { user, tokens };
};

export const login = async (
  data: LoginInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError("Identifiants invalides");
  }

  if (!user.isActive) {
    throw new ForbiddenError("Compte désactivé");
  }

  const isValidPassword = await comparePassword(data.password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError("Identifiants invalides");
  }

  const tokens = await generateTokens(user.id, user.email);

  logger.info({ userId: user.id }, "User logged in");

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    tokens,
  };
};

export const refresh = async (refreshToken: string): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(refreshToken);

  // Vérifier dans Redis
  const storedUserId = await getRefreshToken(refreshToken);

  if (!storedUserId || storedUserId !== payload.userId) {
    throw new UnauthorizedError("Token de rafraîchissement invalide");
  }

  // Vérifier que l'utilisateur existe et est actif
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new UnauthorizedError("Utilisateur introuvable");
  }

  if (!user.isActive) {
    throw new ForbiddenError("Compte désactivé");
  }

  // Supprimer l'ancien token
  await deleteRefreshToken(refreshToken);

  // Générer nouveaux tokens
  const tokens = await generateTokens(payload.userId, payload.email);

  logger.info({ userId: payload.userId }, "Token refreshed");

  return tokens;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await deleteRefreshToken(refreshToken);
  
  // Garder l'historique en DB
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  logger.info("User logged out");
};

export const logoutAll = async (userId: string): Promise<void> => {
  await deleteAllUserRefreshTokens(userId);
  
  // Garder l'historique en DB
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  logger.info({ userId }, "User logged out from all devices");
};

const generateTokens = async (
  userId: string,
  email: string
): Promise<AuthTokens> => {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = generateRefreshToken({ userId, email });
  const expiresAt = getRefreshTokenExpiry();

  // Stocker dans Redis (session active)
  await storeRefreshToken(refreshToken, userId, expiresAt);

  // Stocker dans DB (historique)
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

export const verifyEmail = async (token: string): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw new BadRequestError("Token de vérification invalide");
  }

  if (user.emailVerified) {
    throw new BadRequestError("Email déjà vérifié");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
    },
  });

  logger.info({ userId: user.id }, "Email verified");
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Ne pas révéler si l'email existe ou non
    logger.info({ email }, "Password reset requested for non-existent user");
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);

  logger.info({ userId: user.id }, "Password reset email sent");
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError("Token invalide ou expiré");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  // Déconnecter toutes les sessions
  await deleteAllUserRefreshTokens(user.id);
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  logger.info({ userId: user.id }, "Password reset successful");
};
