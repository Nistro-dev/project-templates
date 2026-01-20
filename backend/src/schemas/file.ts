import { z } from "zod";

// UUID validation stricte
export const fileParamsSchema = z.object({
  id: z
    .string()
    .uuid("ID de fichier invalide")
    .refine(
      (id) => {
        // Validation UUID v4 stricte
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidV4Regex.test(id);
      },
      { message: "Format d'ID invalide" }
    ),
});

// Query parameters pour pagination
export const fileListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 1000),
      { message: "Numéro de page invalide (1-1000)" }
    )
    .transform((val) => (val ? Number(val) : 1)),
  limit: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 100),
      { message: "Limite invalide (1-100)" }
    )
    .transform((val) => (val ? Number(val) : 10)),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Nom de fichier requis")
    .max(255, "Nom de fichier trop long")
    .refine(
      (filename) => {
        // Bloquer path traversal
        return !filename.includes("..") && !filename.includes("/") && !filename.includes("\\");
      },
      { message: "Nom de fichier invalide" }
    )
    .refine(
      (filename) => {
        // Bloquer caractères dangereux
        const dangerousChars = /[<>:"|?*\x00-\x1f]/;
        return !dangerousChars.test(filename);
      },
      { message: "Le nom contient des caractères non autorisés" }
    ),
  mimeType: z
    .string()
    .min(1, "Type MIME requis")
    .refine(
      (mime) => {
        // Whitelist de MIME types autorisés
        const allowedMimes = [
          // Images
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
          // Documents
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          // Texte
          "text/plain",
          "text/csv",
          "text/html",
          "text/css",
          "application/json",
          // Archives (avec prudence)
          "application/zip",
          "application/x-zip-compressed",
          // Vidéo
          "video/mp4",
          "video/mpeg",
          "video/webm",
          // Audio
          "audio/mpeg",
          "audio/wav",
          "audio/webm",
        ];
        return allowedMimes.includes(mime);
      },
      { message: "Type de fichier non autorisé" }
    ),
  size: z
    .number()
    .min(1, "Fichier vide")
    .max(10 * 1024 * 1024, "Fichier trop volumineux (max 10MB)"),
});

export type FileParams = z.infer<typeof fileParamsSchema>;
export type FileListQuery = z.infer<typeof fileListQuerySchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
