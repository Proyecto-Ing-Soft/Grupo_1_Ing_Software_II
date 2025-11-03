export class NotificacionRespuestaDTO {
  id!: number;
  mensaje!: string;
  estado!: 'PENDIENTE' | 'LEIDA';
  creadoEn!: string;
  vehiculoId?: number | null;
  citaId?: number | null;
}
