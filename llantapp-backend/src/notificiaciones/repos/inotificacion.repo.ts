// src/notificaciones/repos/inotificacion.repo.ts
import { Notificacion } from '@prisma/client';

export interface CrearNotificacionDatos {
  usuarioId: number;
  vehiculoId?: number;
  tipo: 'MANTENIMIENTO_KM'|'MANTENIMIENTO_FECHA'|'VENCIMIENTO_LLANTA';
  mensaje: string;
  prioridad: 'BAJA'|'MEDIA'|'ALTA';
  fechaLimite?: Date;
}

export interface INotificacionRepo {
  crear(data: CrearNotificacionDatos): Promise<Notificacion>;
  listarPorUsuario(usuarioId: number): Promise<Notificacion[]>;
  marcarLeida(id: number, usuarioId: number): Promise<void>;
  existePendienteIgual(usuarioId: number, vehiculoId: number|undefined, tipo: string, mensaje: string): Promise<boolean>;
}
