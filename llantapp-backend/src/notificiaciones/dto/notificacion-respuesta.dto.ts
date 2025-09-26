export class NotificacionRespuestaDto {
  id!: number;
  tipo!: 'MANTENIMIENTO_KM' | 'MANTENIMIENTO_FECHA' | 'VENCIMIENTO_LLANTA';
  mensaje!: string;
  prioridad!: 'BAJA' | 'MEDIA' | 'ALTA';
  estado!: 'PENDIENTE' | 'LEIDA';
  fechaLimite?: string;
  vehiculoId?: number;
  creadoEn!: string;
}