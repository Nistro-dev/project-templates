import { FastifyRequest, FastifyReply } from "fastify";
import { fileService } from "../services/index.js";
import { fileParamsSchema, fileListQuerySchema, fileUploadSchema } from "../schemas/index.js";
import { BadRequestError } from "../utils/errors.js";

// Extensions de fichiers dangereuses à bloquer
const DANGEROUS_EXTENSIONS = [
  "exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js", "jar",
  "msi", "app", "deb", "rpm", "sh", "bash", "ps1", "psm1",
];

export const upload = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const data = await request.file();

  if (!data) {
    throw new BadRequestError("Aucun fichier uploadé");
  }

  // Vérifier l'extension du fichier
  const extension = data.filename.split(".").pop()?.toLowerCase();
  if (!extension || DANGEROUS_EXTENSIONS.includes(extension)) {
    throw new BadRequestError("Extension de fichier non autorisée");
  }

  const buffer = await data.toBuffer();

  // Validation stricte avec Zod
  const validatedData = fileUploadSchema.parse({
    filename: data.filename,
    mimeType: data.mimetype,
    size: buffer.length,
  });

  // Vérifier les magic bytes pour éviter le mime type spoofing
  const isValidMimeType = await validateFileMimeType(buffer, validatedData.mimeType);
  if (!isValidMimeType) {
    throw new BadRequestError("Le type de fichier ne correspond pas au contenu");
  }

  const result = await fileService.upload(
    request.user.userId,
    validatedData.filename,
    validatedData.mimeType,
    buffer
  );

  reply.status(201).send(result);
};

export const list = async (
  request: FastifyRequest<{
    Querystring: { page?: string; limit?: string };
  }>,
  reply: FastifyReply
): Promise<void> => {
  // Validation stricte des query params
  const query = fileListQuerySchema.parse(request.query);

  const result = await fileService.list(request.user.userId, query.page, query.limit);

  reply.send(result);
};

// Validation des magic bytes pour détecter mime type spoofing
async function validateFileMimeType(buffer: Buffer, declaredMimeType: string): Promise<boolean> {
  if (buffer.length < 4) return false;

  const magicBytes = buffer.slice(0, 12);

  // Vérification des signatures de fichiers courants
  const signatures: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/jpg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/gif": [[0x47, 0x49, 0x46, 0x38]],
    "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
    "application/zip": [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06]],
    "application/x-zip-compressed": [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06]],
  };

  const expectedSignatures = signatures[declaredMimeType];
  if (!expectedSignatures) {
    // Si pas de signature connue, accepter (text, svg, etc.)
    return true;
  }

  // Vérifier si les magic bytes correspondent
  return expectedSignatures.some((signature) =>
    signature.every((byte, index) => magicBytes[index] === byte)
  );
}

export const download = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const params = fileParamsSchema.parse(request.params);
  const url = await fileService.getDownloadUrl(request.user.userId, params.id);

  reply.send({ url });
};

export const remove = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const params = fileParamsSchema.parse(request.params);
  await fileService.remove(request.user.userId, params.id);

  reply.status(204).send();
};
