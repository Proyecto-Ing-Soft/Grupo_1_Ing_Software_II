export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';
export type Estado = 'PENDIENTE' | 'LEIDA';

export interface CrearNotificacion {
  usuarioId: number;
  mensaje: string;
  prioridad?: Prioridad;
  vehiculoId?: number | null;
  citaId?: number | null;
}

export interface NotificacionEntidad {
  id: number;
  usuarioId: number;
  mensaje: string;
  prioridad: Prioridad;
  estado: Estado;
  creadoEn: Date;
  vehiculoId?: number | null;
  citaId?: number | null;
}

export interface INotificacionRepo {
  crear(data: CrearNotificacion): Promise<void>;
  listarPorUsuario(usuarioId: number): Promise<NotificacionEntidad[]>;
  marcarLeida(id: number, usuarioId: number): Promise<void>;
}
