// PRINCIPIOS:
// - SRP: este controller solo expone la lectura de la bitácora.
// - KISS: un único GET con filtros básicos (citaId, limit).
// - Ley de Demeter: delega en Prisma, sin mezclar lógica de creación.

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('auditoria/acciones')
export class AccionesAuditoriaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listar(
    @Query('citaId') citaId?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Math.max(Number(limit) || 50, 1), 200);

    const where: any = {};
    if (citaId && !Number.isNaN(Number(citaId))) {
      where.citaId = Number(citaId);
    }

    const filas = await this.prisma.accionUsuario.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      take,
      include: {
        usuario: { select: { id: true, nombreCompleto: true } },
        cita: { select: { id: true, tipo: true, estado: true } },
      },
    });

    return filas.map((f) => ({
      id: f.id,
      tipo: f.tipo,
      descripcion: f.descripcion,
      creadoEn: f.creadoEn.toISOString(),
      usuario: f.usuario,
      cita: f.cita,
      mecanicoId: f.mecanicoId ?? null,
    }));
  }
}
