import { Injectable } from '@nestjs/common';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';

// PRINCIPIO (SRP): casos de uso HTTP para listar y marcar notificaciones.

@Injectable()
export class NotificacionesService {
  constructor(private readonly repo: NotificacionPrismaRepo) {}

  async listarPorUsuario(tallerSlug: string, usuarioId: number) {
    const filas = await this.repo.listarPorUsuario(tallerSlug, usuarioId);

    return filas.map((n) => ({
      id: n.id,
      mensaje: n.mensajeHtml,
      estado: n.estadoCodigo,
      creadoEn: n.creadoEn.toISOString(),
      // Sin columnas dedicadas en la BD nueva; se exponen como null.
      vehiculoId: null,
      citaId: null,
    }));
  }

  async marcarLeida(
    tallerSlug: string,
    id: number,
    usuarioId: number,
  ): Promise<{ ok: boolean }> {
    await this.repo.marcarLeida(tallerSlug, id, usuarioId);
    return { ok: true };
  }
}
