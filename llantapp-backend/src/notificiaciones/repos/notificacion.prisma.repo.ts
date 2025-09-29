// src/notificaciones/repos/notificacion.prisma.repo.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificacionPrismaRepo {
  constructor(private prisma: PrismaService) {}

  async listarPorUsuario(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: [{ estado: 'asc' }, { prioridad: 'desc' }, { creadoEn: 'desc' }],
    });
  }

  async marcarLeida(id: number, usuarioId: number) {
    const n = await this.prisma.notificacion.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('No existe la notificación');
    if (n.usuarioId !== usuarioId) throw new ForbiddenException('No autorizado');
    if (n.estado === 'LEIDA') return;
    await this.prisma.notificacion.update({ where: { id }, data: { estado: 'LEIDA' as any } });
  }
}
