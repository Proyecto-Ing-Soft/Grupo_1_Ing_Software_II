// llantapp-frontend/src/features/mantenimientos/citaSchemas.ts
import { z } from "zod";

const anioMax = new Date().getFullYear() + 1;

// 📌 Esquema de validación para agendar cita usando servicioId del catálogo
export const esquemaCita = z
  .object({
    // ID del servicio (viene del catálogo). Lo manejamos como opcional
    // para el formulario, pero lo validamos luego con refine.
    servicioId: z.number().int().positive().optional(),

    // Si elige un vehículo registrado
    vehiculoId: z.number().int().positive().optional(),

    // Snapshot de vehículo cuando no hay vehiculoId
    placaPreliminar: z.string().max(15).optional(),
    marcaPreliminar: z.string().max(80).optional(),
    modeloPreliminar: z.string().max(80).optional(),
    anioPreliminar: z
      .number()
      .int()
      .min(1950)
      .max(anioMax)
      .optional(),
    colorPreliminar: z.string().max(50).optional(),
    vinPreliminar: z.string().max(30).optional(),

    comentario: z.string().max(500).optional(),

    // Fecha en formato "YYYY-MM-DD"
    programadaPara: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (usa AAAA-MM-DD)"),
  })
  // Debe seleccionar un servicio del catálogo
  .refine((data) => data.servicioId != null, {
    message: "Selecciona un servicio del catálogo",
    path: ["servicioId"],
  })
  // Debe seleccionar un vehículo o llenar placa/marca/modelo
  .refine(
    (data) =>
      !!data.vehiculoId ||
      ((data.placaPreliminar ?? "").trim().length > 0 &&
        (data.marcaPreliminar ?? "").trim().length > 0 &&
        (data.modeloPreliminar ?? "").trim().length > 0),
    {
      message:
        "Selecciona un vehículo o completa placa, marca y modelo del vehículo",
      path: ["vehiculoId"],
    }
  );

export type CitaForm = z.infer<typeof esquemaCita>;
