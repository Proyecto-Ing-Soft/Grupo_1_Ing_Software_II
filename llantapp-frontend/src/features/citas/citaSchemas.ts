// SRP: solo validaciones de "agendar cita".
// KISS: reglas claras; mensajes directos.
import { z } from "zod";

export const esquemaCita = z
  .object({
    vehiculoId: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === "" || v == null) return undefined;
        const n = typeof v === "string" ? Number(v) : v;
        return Number.isFinite(n) ? n : undefined;
      }),
    servicioId: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === "" || v == null) return undefined;
        const n = typeof v === "string" ? Number(v) : v;
        return Number.isFinite(n) ? n : undefined;
      }),

    comentario: z.string().trim().max(500, "Comentario muy largo").optional(),

    programadaPara: z
      .string()
      .nonempty("Selecciona una fecha")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  })
  .superRefine((data, ctx) => {
    if (!data.vehiculoId) {
      ctx.addIssue({
        code: "custom",
        path: ["vehiculoId"],
        message: "Selecciona un vehículo",
      });
    }
    if (!data.servicioId) {
      ctx.addIssue({
        code: "custom",
        path: ["servicioId"],
        message: "Selecciona un servicio",
      });
    }
  });

export type CitaForm = z.infer<typeof esquemaCita>;
