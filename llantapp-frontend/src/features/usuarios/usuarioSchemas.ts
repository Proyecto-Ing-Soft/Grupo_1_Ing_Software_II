import { z } from 'zod';

// SRP: Validaciones de formularios.
// DRY: reutilizable en Login y Registro.
export const esquemaRegistro = z.object({
  nombreCompleto: z.string().min(3, 'Nombre muy corto'),
  correo: z.string().email('Correo inválido'),
  clave: z.string().min(8, 'Mínimo 8 caracteres'),
  rol: z.string().optional(),
});

export const esquemaLogin = z.object({
  correo: z.string().email('Correo inválido'),
  clave: z.string().min(8, 'Mínimo 8 caracteres'),
});