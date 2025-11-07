// SRP: solo validaciones de "agendar cita".
// KISS: reglas claras; mensajes directos.
import { z } from "zod";

export const esquemaCita = z
  .object({
    tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "LEGAL_ITV", "EXTRAS"]),

    // si el usuario elige un vehículo ya registrado
    vehiculoId: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : Number(v))),

    // Preliminares (solo requeridos si NO hay vehiculoId)
    placaPreliminar: z.string().trim().max(10, "Placa muy larga").optional(),
    marcaPreliminar: z.string().trim().optional(),
    modeloPreliminar: z.string().trim().optional(),

    anioPreliminar: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : Number(v)))
      .refine(
        (v) =>
          v === undefined ||
          (Number.isFinite(v) && v >= 1950 && v <= new Date().getFullYear() + 1),
        "Año inválido"
      ),

    colorPreliminar: z.string().trim().optional(),
    vinPreliminar: z.string().trim().optional(),
    comentario: z.string().trim().optional(),

    programadaPara: z
      .string()
      .nonempty("Selecciona una fecha")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  })
  .superRefine((data, ctx) => {
    // Regla: debe escoger vehiculoId o completar placa/marca/modelo
    if (!data.vehiculoId) {
      if (!data.placaPreliminar?.trim()) {
        ctx.addIssue({ code: "custom", path: ["placaPreliminar"], message: "Placa obligatoria" });
      }
      if (!data.marcaPreliminar?.trim()) {
        ctx.addIssue({ code: "custom", path: ["marcaPreliminar"], message: "Marca obligatoria" });
      }
      if (!data.modeloPreliminar?.trim()) {
        ctx.addIssue({ code: "custom", path: ["modeloPreliminar"], message: "Modelo obligatorio" });
      }
    }
  });

export type CitaForm = z.infer<typeof esquemaCita>;
