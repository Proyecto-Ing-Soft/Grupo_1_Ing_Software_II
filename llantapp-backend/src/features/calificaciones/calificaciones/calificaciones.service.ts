import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { CalificacionDto } from './dto/calificacion.dto';

// Ajusta según tu enum. Si usas Prisma enum:
import { EstadoCita } from '@prisma/client';

import { NotificacionesService } from '../../../features/notificaciones/notificaciones/notificaciones.service';

@Injectable()
export class CalificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    // comenta esta línea si aún no lo quieres enganchar
    private readonly noti: NotificacionesService,
  ) {}

  /**
   * Crea una calificación para una cita TERMINADA.
   * Reglas:
   *  - Solo el cliente dueño de la cita puede calificar.
   *  - Solo si la cita está TERMINADA.
   *  - Una calificación por cita.
   */
  async crear(citaId: number, clienteId: number, dto: CalificacionDto) {
    const cita = await this.prisma.citaMantenimiento.findUnique({
      where: { id: citaId },
      select: { id: true, clienteId: true, estado: true, mecanicoId: true, vehiculoId: true },
    });

    if (!cita) throw new NotFoundException('Cita no encontrada');
    if (cita.clienteId !== clienteId) {
      throw new ForbiddenException('No puedes calificar esta cita');
    }
    if (cita.estado !== EstadoCita.TERMINADA) {
      throw new BadRequestException('Solo se puede calificar una cita terminada');
    }

    const yaHay = await this.prisma.calificacionCita.findUnique({ where: { citaId } });
    if (yaHay) throw new BadRequestException('Esta cita ya fue calificada');

    const creada = await this.prisma.calificacionCita.create({
      data: {
        citaId,
        clienteId,
        estrellas: dto.estrellas,
        comentario: dto.comentario ?? null,
      },
    });

    // (Opcional) Notificar al mecánico que recibió calificación
    if (cita.mecanicoId) {
      try {
        await this.noti.enviar({
          usuarioId: cita.mecanicoId,
          citaId,
           vehiculoId: cita.vehiculoId ?? undefined,
          titulo: 'Nueva calificación recibida',
          mensaje: `El cliente calificó la cita #${citaId} con ${dto.estrellas}★.`,
        });
      } catch {
        // no romper el flujo si fallan notificaciones
      }
    }

    return { ok: true, id: creada.id };
  }

  /**
   * Lee la calificación de una cita.
   * Visible para:
   *  - Cliente dueño de la cita
   *  - Mecánico asignado
   *  - (Opcional) Roles admin si manejas roles en req.user.rol
   */
  async leerPorCita(citaId: number, solicitanteId: number, rol?: string) {
    const cita = await this.prisma.citaMantenimiento.findUnique({
      where: { id: citaId },
      select: { id: true, clienteId: true, mecanicoId: true },
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');

    const esDueno = cita.clienteId === solicitanteId;
    const esMecanico = cita.mecanicoId === solicitanteId;
    const esAdmin = rol === 'ADMIN';

    if (!esDueno && !esMecanico && !esAdmin) {
      throw new ForbiddenException('No puedes ver esta calificación');
    }

    const calif = await this.prisma.calificacionCita.findUnique({ where: { citaId } });
    if (!calif) throw new NotFoundException('La cita aún no tiene calificación');

    return calif;
  }

   async miasCliente(clienteId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.calificacionCita.findMany({
        where: { clienteId },
        orderBy: { creadaEn: 'desc' },
        skip,
        take: pageSize,
        include: {
          cita: {
            select: {
              id: true, estado: true, vehiculoId: true, fechaMantenimiento: true,
              placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
            },
          },
        },
      }),
      this.prisma.calificacionCita.count({ where: { clienteId } }),
    ]);
    return { items, total, page, pageSize };
  }

  async recibidasMecanico(mecanicoId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.calificacionCita.findMany({
        where: { cita: { mecanicoId } },                // ← join por relación
        orderBy: { creadaEn: 'desc' },
        skip,
        take: pageSize,
        include: {
          cita: {
            select: {
              id: true, estado: true, vehiculoId: true, fechaMantenimiento: true,
              placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
            },
          },
          cliente: { select: { id: true, nombreCompleto: true } },
        },
      }),
      this.prisma.calificacionCita.count({ where: { cita: { mecanicoId } } }),
    ]);
    return { items, total, page, pageSize };
  }

  async adminList(
    page: number,
    pageSize: number,
    filtros: {
      mecanicoId?: number;
      estrellas?: number;
      desde?: Date;
      hasta?: Date;
      placa?: string;
    },
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = {
      ...(filtros.estrellas ? { estrellas: filtros.estrellas } : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            creadaEn: {
              ...(filtros.desde ? { gte: filtros.desde } : {}),
              ...(filtros.hasta ? { lte: filtros.hasta } : {}),
            },
          }
        : {}),
      ...(filtros.mecanicoId || filtros.placa
        ? {
            cita: {
              ...(filtros.mecanicoId ? { mecanicoId: filtros.mecanicoId } : {}),
              ...(filtros.placa
                ? { placaPreliminar: { contains: filtros.placa, mode: 'insensitive' } }
                : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.calificacionCita.findMany({
        where,
        orderBy: { creadaEn: 'desc' },
        skip,
        take: pageSize,
        include: {
          cliente: { select: { id: true, nombreCompleto: true } },
          cita: {
            select: {
              id: true, mecanicoId: true, estado: true, fechaMantenimiento: true,
              placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
              mecanico: { select: { id: true, nombreCompleto: true } },
            },
          },
        },
      }),
      this.prisma.calificacionCita.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async adminStats() {
    // distribución por estrellas
    const distribRaw = await this.prisma.calificacionCita.groupBy({
      by: ['estrellas'],
      _count: { estrellas: true },
      orderBy: { estrellas: 'asc' },
    });
    const distribucion = distribRaw.map((r) => ({ estrellas: r.estrellas, total: r._count.estrellas }));

    // promedio por mecánico
    const porMecanico = await this.prisma.calificacionCita.groupBy({
      by: ['citaId'],
      _avg: { estrellas: true },
    });

    // Sacamos el mecánico real por cita en un solo query
    const citasIds = porMecanico.map((x) => x.citaId);
    const citas = await this.prisma.citaMantenimiento.findMany({
      where: { id: { in: citasIds } },
      select: { id: true, mecanicoId: true, mecanico: { select: { id: true, nombreCompleto: true } } },
    });
    const mapMec: Record<number, { id: number; nombreCompleto: string }> = {};
    for (const c of citas) {
      if (c.mecanicoId && c.mecanico) mapMec[c.id] = c.mecanico;
    }

    // Agregamos por mecánico
    const agg: Record<number, { mecanicoId: number; nombre: string; suma: number; n: number }> = {};
    for (const row of porMecanico) {
      const mec = mapMec[row.citaId];
      if (!mec) continue;
      if (!agg[mec.id]) agg[mec.id] = { mecanicoId: mec.id, nombre: mec.nombreCompleto, suma: 0, n: 0 };
      agg[mec.id].suma += row._avg.estrellas ?? 0;
      agg[mec.id].n += 1;
    }
    const promedioPorMecanico = Object.values(agg)
      .map((x) => ({ mecanicoId: x.mecanicoId, nombre: x.nombre, promedio: +(x.suma / x.n).toFixed(2), n: x.n }))
      .sort((a, b) => b.promedio - a.promedio);

    // promedio global
    const global = await this.prisma.calificacionCita.aggregate({ _avg: { estrellas: true }, _count: true });

    return {
      promedioGlobal: +(global._avg.estrellas ?? 0).toFixed(2),
      totalCalificaciones: global._count,
      distribucion,           // [{estrellas:1..5, total}]
      promedioPorMecanico,    // [{mecanicoId, nombre, promedio, n}]
    };
  }
}
