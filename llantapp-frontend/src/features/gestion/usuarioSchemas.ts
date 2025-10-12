import { z } from 'zod';

export const esquemaUsuarioTallerCrear = z.object({
  nombreCompleto: z.string().min(3, 'Nombre muy corto'),
  correo: z.string().email('Correo inválido'),
  clave: z.string().min(8, 'Mínimo 8 caracteres'),
  rol: z.enum(['ADMIN', 'MECANICO']),
});

export const esquemaUsuarioTallerEditar = z.object({
  nombreCompleto: z.string().min(3, 'Nombre muy corto'),
  correo: z.string().email('Correo inválido'),
  rol: z.enum(['ADMIN', 'MECANICO']),
});
