import { Injectable } from '@nestjs/common';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';

@Injectable()
export class NotificacionesService {
  constructor(private readonly repo: NotificacionPrismaRepo) {}

  async listarPorUsuario(usuarioId: number) {
    const filas = await this.repo.listarPorUsuario(usuarioId);
    return filas.map(n => ({
      id: n.id,
      mensaje: n.mensaje,
      prioridad: n.prioridad,
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
