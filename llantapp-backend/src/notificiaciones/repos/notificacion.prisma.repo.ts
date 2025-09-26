// src/notificaciones/repos/notificacion.prisma.repo.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearNotificacionDatos, INotificacionRepo } from './inotificacion.repo';
import { EstadoNotificacion } from '@prisma/client';

@Injectable()
export class NotificacionPrismaRepo implements INotificacionRepo {
  constructor(private prisma: PrismaService) {}

  crear(data: CrearNotificacionDatos) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId: data.usuarioId,
        vehiculoId: data.vehiculoId,
        tipo: data.tipo as any,
        mensaje: data.mensaje,
        prioridad: data.prioridad as any,
        fechaLimite: data.fechaLimite,
      },
    });
  }

  listarPorUsuario(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
    });
  }

  async marcarLeida(id: number, usuarioId: number) {
    await this.prisma.notificacion.update({
      where: { id },
      data: { estado: EstadoNotificacion.LEIDA },
    });
  }

  async existePendienteIgual(usuarioId: number, vehiculoId: number|undefined, tipo: string, mensaje: string) {
    const existe = await this.prisma.notificacion.findFirst({
      where: {
        usuarioId,
        vehiculoId: vehiculoId ?? undefined,
        tipo: tipo as any,
        mensaje,
        estado: EstadoNotificacion.PENDIENTE,
      },
      select: { id: true },
    });
    return !!existe;
  }
}
