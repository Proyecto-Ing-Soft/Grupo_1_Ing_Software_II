// SRP: solo validaciones de "agendar cita".
// KISS: reglas claras; mensajes directos.
import { z } from "zod";

export const esquemaCita = z.object({
  // requerido por defecto; si quieres mensaje custom, haz un refine adicional
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "LEGAL_ITV", "EXTRAS"]),

  placaPreliminar: z.string()
    .trim()
    .nonempty("Placa obligatoria")
    .max(10, "Placa muy larga"),

  marcaPreliminar: z.string()
    .trim()
    .min(2, "Marca obligatoria"),

  modeloPreliminar: z.string()
    .trim()
    .min(1, "Modelo obligatorio"),

  anioPreliminar: z.union([z.string(), z.number()])
    .optional()
    .transform(v => (v === "" || v == null ? undefined : Number(v)))
    .refine(
      v => v === undefined || (Number.isFinite(v) && v >= 1950 && v <= new Date().getFullYear() + 1),
      "Año inválido"
    ),

  colorPreliminar: z.string().trim().optional(),
  vinPreliminar: z.string().trim().optional(),
  comentario: z.string().trim().optional(),

  programadaPara: z.string()
    .nonempty("Selecciona una fecha")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
});

export type CitaForm = z.infer<typeof esquemaCita>;
