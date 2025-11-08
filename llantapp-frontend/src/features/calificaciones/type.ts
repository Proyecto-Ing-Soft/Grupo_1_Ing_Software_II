export interface Calificacion {
  id: number;
  mantenimientoId: number;          // ← nuevo en base a Prisma
  clienteUsuarioId: number;         // ← nuevo en base a Prisma
  estrellas: number;                // ← mapeo de puntuacion (1–5)
  comentario?: string | null;
  creadaEn: string;                 // ← mapeo de fecha_creacion (ISO)
  visible?: boolean;                // ← opcional
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  citaId?: number | null;
}
