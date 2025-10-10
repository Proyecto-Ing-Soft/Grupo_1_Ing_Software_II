import { Injectable } from '@nestjs/common';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';

// SRP + Facade: interfaz simple para publicar notificaciones desde el dominio
export interface EnvioNotificacion {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  vehiculoId?: number;
  citaId?: number;
}

@Injectable()
export class NotificacionesService {
  constructor(private readonly repo: NotificacionPrismaRepo) {}

  async enviar(data: EnvioNotificacion): Promise<void> {

    const cuerpo = `${data.titulo}: ${data.mensaje}`;
    await this.repo.crear({
      usuarioId: data.usuarioId,
      mensaje: cuerpo,
      vehiculoId: data.vehiculoId,
      citaId: data.citaId,
    });
  }

  async listarPorUsuario(usuarioId: number) {
    const filas = await this.repo.listarPorUsuario(usuarioId);
    return filas.map(n => ({
      id: n.id,
      mensaje: n.mensaje,
      estado: n.estado,
      creadoEn: n.creadoEn.toISOString(),
      vehiculoId: n.vehiculoId ?? null,
      citaId: n.citaId ?? null,
    }));
  }

  async marcarLeida(id: number, usuarioId: number) {
    await this.repo.marcarLeida(id, usuarioId);
    return { ok: true };
  }
}
