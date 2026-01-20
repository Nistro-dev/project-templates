import { z } from 'zod'

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Un fichier est requis" })
    .refine((file) => file.size > 0, "Le fichier ne peut pas être vide")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      "La taille du fichier ne peut pas dépasser 10MB"
    ),
})

// Type exports
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
