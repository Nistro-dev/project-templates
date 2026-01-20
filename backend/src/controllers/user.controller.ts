import { FastifyRequest, FastifyReply } from "fastify";
import * as userService from "../services/user.service.js";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/auth.js";

export const getProfile = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const profile = await userService.getProfile(request.user.userId);
  reply.send(profile);
};

export const updateProfile = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const data = updateProfileSchema.parse(request.body);
  const profile = await userService.updateProfile(request.user.userId, data);
  reply.send(profile);
};

export const changePassword = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const data = changePasswordSchema.parse(request.body);
  await userService.changePassword(request.user.userId, data);
  reply.send({ message: "Mot de passe modifié avec succès" });
};
