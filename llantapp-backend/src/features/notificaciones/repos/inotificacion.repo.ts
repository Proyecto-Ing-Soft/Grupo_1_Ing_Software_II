// Tipos alineados a la BD: los códigos de estado/canal/tipo_mensaje vienen de tablas app.*
// No se definen enums ni listas estáticas en código.

export interface CrearNotificacion {
  tallerSlug: string;
  usuarioId: number;
  titulo: string;
  mensajeHtml: string;
  tipoMensajeCodigo?: string;
  canalCodigo?: string;
}

export interface NotificacionEntidad {
  id: number;
  usuarioId: number;
  titulo: string;
  mensajeHtml: string;
  estadoCodigo: string;
  estadoNombre: string;
  creadoEn: Date;
}

export interface INotificacionRepo {
  crear(data: CrearNotificacion): Promise<void>;

  listarPorUsuario(
    tallerSlug: string,
    usuarioId: number,
  ): Promise<NotificacionEntidad[]>;

  marcarLeida(
    tallerSlug: string,
    id: number,
    usuarioId: number,
  ): Promise<void>;
}
