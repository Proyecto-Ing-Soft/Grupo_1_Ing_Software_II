// src/tipos/notificacion.ts
export type TipoNotificacion = 'MANTENIMIENTO_KM'|'MANTENIMIENTO_FECHA'|'VENCIMIENTO_LLANTA';
export type Prioridad = 'BAJA'|'MEDIA'|'ALTA';
export type Estado = 'PENDIENTE'|'LEIDA';

export interface NotificacionDTO {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  prioridad: Prioridad;
  estado: Estado;
  fechaLimite?: string;
  vehiculoId?: number;
  creadoEn: string;
}

export const etiquetaTipo: Record<TipoNotificacion, string> = {
MANTENIMIENTO_KM:    'Mantenimiento por km',
MANTENIMIENTO_FECHA: 'Mantenimiento por fecha',
VENCIMIENTO_LLANTA:  'Vencimiento de llanta',
};