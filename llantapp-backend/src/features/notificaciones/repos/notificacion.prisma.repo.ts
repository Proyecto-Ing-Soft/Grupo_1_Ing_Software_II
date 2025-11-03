import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { EstadoNotificacion } from '@prisma/client'; // enum

type CrearNotificacion = {
  usuarioId: number;
  mensaje: string;
  vehiculoId?: number | null;
  citaId?: number | null;
};

@Injectable()
export class NotificacionPrismaRepo {
  constructor(private prisma: PrismaService) {}

  // crear notificación (lo usará el Notificador)
  async crear(data: CrearNotificacion) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId: data.usuarioId,
        mensaje: data.mensaje,
        vehiculoId: data.vehiculoId ?? null,
        citaId: data.citaId ?? null,
      },
    });
  }

  async listarPorUsuario(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
    });
  }

  async marcarLeida(id: number, usuarioId: number) {
    const n = await this.prisma.notificacion.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('No existe la notificación');
    if (n.usuarioId !== usuarioId) throw new ForbiddenException('No autorizado');
    if (n.estado === EstadoNotificacion.LEIDA) return; // enum
    await this.prisma.notificacion.update({
      where: { id },
      data: { estado: EstadoNotificacion.LEIDA }, // enum
    });
  }
}
