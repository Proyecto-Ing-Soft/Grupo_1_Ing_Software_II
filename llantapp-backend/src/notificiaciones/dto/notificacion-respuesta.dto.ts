export class NotificacionRespuestaDTO {
  id!: number;
  mensaje!: string;
  prioridad!: 'BAJA' | 'MEDIA' | 'ALTA';
  estado!: 'PENDIENTE' | 'LEIDA';
  creadoEn!: string;
  vehiculoId?: number | null;
  citaId?: number | null;
}
