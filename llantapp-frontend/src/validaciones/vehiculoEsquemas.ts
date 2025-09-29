// validaciones/vehiculoEsquemas.ts
import { z } from 'zod';

/**
 * SRP: esquema de validación de vehículos (front).
 * OCP: agrega reglas sin romper a los consumidores.
 */
export const esquemaVehiculo = z.object({
  placa: z
    .string()
    .min(5, 'La placa debe tener 5 a 10 caracteres')
    .max(10, 'La placa debe tener 5 a 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'La placa solo admite letras, números y guiones')
    .transform((s) => s.toUpperCase().trim()),
  marca: z.string().min(1, 'La marca es obligatoria'),
  modelo: z.string().min(1, 'El modelo es obligatorio'),
  anio: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'El color es obligatorio'),
  vin: z.string().min(8, 'VIN mínimo 8').max(30, 'VIN máximo 30').optional().or(z.literal('')),
});

export type FormVehiculo = z.infer<typeof esquemaVehiculo>;
