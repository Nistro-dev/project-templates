import { z } from 'zod'

// Email validation - Protection XSS et injection
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

// Name validation - Protection XSS
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

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis").max(128, "Mot de passe invalide"),
  remember: z.boolean().optional(),
})

// Register schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
    firstName: nameSchema,
    lastName: nameSchema,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ['confirmPassword'],
  })

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Le token est requis")
      .max(500, "Token invalide")
      .refine(
        (token) => {
          const validPattern = /^[a-zA-Z0-9._-]+$/;
          return validPattern.test(token);
        },
        { message: "Format de token invalide" }
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ['confirmPassword'],
  })

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
})

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis").max(128),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "La confirmation du nouveau mot de passe est requise"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ['newPassword'],
  })

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
