import { prisma } from "../utils/prisma.js";
import {
  hashPassword,
  comparePassword,
  logger,
  NotFoundError,
  BadRequestError,
} from "../utils/index.js";
import type { UpdateProfileInput, ChangePasswordInput } from "../schemas/auth.js";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Utilisateur introuvable");
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<UserProfile> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info({ userId }, "Profile updated");

  return user;
};

export const changePassword = async (
  userId: string,
  data: ChangePasswordInput
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("Utilisateur introuvable");
  }

  const isValidPassword = await comparePassword(
    data.currentPassword,
    user.password
  );

  if (!isValidPassword) {
    throw new BadRequestError("Mot de passe actuel incorrect");
  }

  const hashedPassword = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Déconnecter toutes les sessions sauf celle actuelle
  // (optionnel - on pourrait aussi déconnecter toutes les sessions)
  logger.info({ userId }, "Password changed");
};
