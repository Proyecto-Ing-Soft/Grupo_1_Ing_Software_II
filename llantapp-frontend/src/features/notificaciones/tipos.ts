export type PrioridadNotificacion = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoNotificacion = 'PENDIENTE' | 'LEIDA';

export interface NotificacionDTO {
  id: number;
  mensaje: string;
  prioridad: PrioridadNotificacion;
  estado: EstadoNotificacion;
  creadoEn: string; // ISO
  vehiculoId?: number | null;
  citaId?: number | null;
}
