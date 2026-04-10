import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Correo electrónico inválido").max(255),
  password: z.string().min(1, "La contraseña es requerida").max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(100, "Nombre muy largo"),
  email: z.string().trim().email("Correo electrónico inválido").max(255),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128, "Máximo 128 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
  empresaNombre: z.string().max(200).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const analysisSchema = z.object({
  cvText: z.string().trim().min(50, "El CV debe tener al menos 50 caracteres").max(50000, "El CV es demasiado largo"),
  jobText: z.string().trim().min(30, "La oferta debe tener al menos 30 caracteres").max(50000, "La oferta es demasiado larga"),
});

export const jobUrlSchema = z.object({
  url: z.string().url("URL inválida").refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "La URL debe comenzar con http:// o https://"
  ),
});

// Rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

export function checkRateLimit(email: string): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record) {
    loginAttempts.set(email, { count: 1, blockedUntil: 0 });
    return { allowed: true, waitSeconds: 0 };
  }

  if (record.blockedUntil > now) {
    const waitSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  record.count++;

  if (record.count > 5) {
    // Progressive cooldown: 30s, 60s, 120s
    const cooldown = Math.min(30000 * Math.pow(2, record.count - 6), 120000);
    record.blockedUntil = now + cooldown;
    return { allowed: false, waitSeconds: Math.ceil(cooldown / 1000) };
  }

  return { allowed: true, waitSeconds: 0 };
}

export function resetRateLimit(email: string) {
  loginAttempts.delete(email);
}

// PDF validation
const ALLOWED_PDF_MIME = "application/pdf";
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

export function validatePdfFile(file: File): string | null {
  if (file.type !== ALLOWED_PDF_MIME) {
    return "Solo se permiten archivos PDF";
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "El archivo debe tener extensión .pdf";
  }
  if (file.size > MAX_PDF_SIZE) {
    return "El archivo no puede superar los 5 MB";
  }
  if (file.size === 0) {
    return "El archivo está vacío";
  }
  return null;
}
