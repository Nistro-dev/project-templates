import { z } from "zod";

// Email validation - identique au backend
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "L'email doit contenir au moins 3 caractères")
  .max(254, "L'email ne peut pas dépasser 254 caractères")
  .email("Format d'email invalide")
  .refine(
    (email) => {
      const dangerousChars = /[<>'"`;(){}[\]\\]/;
      return !dangerousChars.test(email);
    },
    { message: "L'email contient des caractères non autorisés" }
  )
  .refine(
    (email) => {
      const emailRegex = /^[a-z0-9]([a-z0-9._+-]{0,61}[a-z0-9])?@[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
      return emailRegex.test(email);
    },
    { message: "Format d'email invalide" }
  );

// Password validation - sécurité forte
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

// Name validation
const nameSchema = z
  .string()
  .trim()
  .min(1, "Ce champ est requis")
  .max(100, "Ce champ ne peut pas dépasser 100 caractères")
  .refine(
    (name) => {
      const dangerousPattern = /[<>'"`;(){}[\]\\]/;
      return !dangerousPattern.test(name);
    },
    { message: "Ce champ contient des caractères non autorisés" }
  )
  .refine(
    (name) => {
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
});

// Register schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: nameSchema,
    lastName: nameSchema,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token invalide"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Types
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// Helper pour afficher les erreurs Zod
export function getZodErrorMessage(error: z.ZodError, field: string): string | undefined {
  const fieldError = error.errors.find((err) => err.path.join(".") === field);
  return fieldError?.message;
}

// Helper pour valider un fichier côté client
export function validateFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    "application/zip",
    "video/mp4",
    "audio/mpeg",
  ];

  const DANGEROUS_EXTENSIONS = [
    "exe",
    "bat",
    "cmd",
    "com",
    "pif",
    "scr",
    "vbs",
    "js",
    "jar",
    "msi",
    "app",
    "deb",
    "rpm",
    "sh",
    "bash",
    "ps1",
  ];

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // Vérifier la taille
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "Le fichier est trop volumineux (max 10MB)" };
  }

  if (file.size === 0) {
    return { valid: false, error: "Le fichier est vide" };
  }

  // Vérifier le type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Type de fichier non autorisé" };
  }

  // Vérifier l'extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || DANGEROUS_EXTENSIONS.includes(extension)) {
    return { valid: false, error: "Extension de fichier non autorisée" };
  }

  // Vérifier path traversal dans le nom
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return { valid: false, error: "Nom de fichier invalide" };
  }

  return { valid: true };
}
