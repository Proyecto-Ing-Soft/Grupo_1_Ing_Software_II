export class NotificacionRespuestaDTO {
  id!: number;
  mensaje!: string;
  // El estado viene como código desde la tabla app.estado_notificacion (sin enums locales).
  estado!: string;
  creadoEn!: string;
  // Referencias opcionales; si la implementación no las persiste en BD, se devuelven como null.
  vehiculoId?: number | null;
  citaId?: number | null;
}
