import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: "Vérification de votre email",
      html: `
        <h1>Vérification de votre email</h1>
        <p>Merci de vous être inscrit ! Veuillez cliquer sur le lien ci-dessous pour vérifier votre email :</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    });

    logger.info({ email }, "Verification email sent");
  } catch (error) {
    logger.error({ email, error }, "Failed to send verification email");
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    });

    logger.info({ email }, "Password reset email sent");
  } catch (error) {
    logger.error({ email, error }, "Failed to send password reset email");
    throw error;
  }
};
