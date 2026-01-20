import { z } from "zod";

// Email validation - RFC 5322 compliant avec protection contre bypass
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "L'email doit contenir au moins 3 caractères")
  .max(254, "L'email ne peut pas dépasser 254 caractères")
  .email("Format d'email invalide")
  .refine(
    (email) => {
      // Bloquer les emails avec caractères dangereux
      const dangerousChars = /[<>'"`;(){}[\]\\]/;
      return !dangerousChars.test(email);
    },
    { message: "L'email contient des caractères non autorisés" }
  )
  .refine(
    (email) => {
      // Vérifier format basique email
      const emailRegex = /^[a-z0-9]([a-z0-9._+-]{0,61}[a-z0-9])?@[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
      return emailRegex.test(email);
    },
    { message: "Format d'email invalide" }
  );

// Password validation - Sécurité forte
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
  .refine(
    (password) => /[A-Z]/.test(password),
    { message: "Le mot de passe doit contenir au moins une majuscule" }
  )
  .refine(
    (password) => /[a-z]/.test(password),
    { message: "Le mot de passe doit contenir au moins une minuscule" }
  )
  .refine(
    (password) => /[0-9]/.test(password),
    { message: "Le mot de passe doit contenir au moins un chiffre" }
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    { message: "Le mot de passe doit contenir au moins un caractère spécial" }
  );

// Name validation - Protection XSS et injection
const nameSchema = z
  .string()
  .trim()
  .min(1, "Ce champ est requis")
  .max(100, "Ce champ ne peut pas dépasser 100 caractères")
  .refine(
    (name) => {
      // Bloquer HTML/script tags et caractères dangereux
      const dangerousPattern = /[<>'"`;(){}[\]\\]/;
      return !dangerousPattern.test(name);
    },
    { message: "Ce champ contient des caractères non autorisés" }
  )
  .refine(
    (name) => {
      // Autoriser uniquement lettres, espaces, tirets, apostrophes
      const validPattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
      return validPattern.test(name);
    },
    { message: "Ce champ ne peut contenir que des lettres, espaces, tirets et apostrophes" }
  );

// Token validation - UUID ou hex string
const tokenSchema = z
  .string()
  .min(1, "Le token est requis")
  .max(500, "Token invalide")
  .refine(
    (token) => {
      // Autoriser uniquement alphanumériques et tirets (UUID/JWT format)
      const validPattern = /^[a-zA-Z0-9._-]+$/;
      return validPattern.test(token);
    },
    { message: "Format de token invalide" }
  );

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis").max(128, "Mot de passe invalide"),
});

export const refreshTokenSchema = z.object({
  refreshToken: tokenSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis").max(128, "Mot de passe invalide"),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
