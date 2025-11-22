// PRINCIPIOS:
// - SRP: este controller solo expone la lectura de la bitácora.
// - KISS: un único GET con filtros básicos (citaId, limit).
// - Ley de Demeter: delega en AccionesAuditoriaService.

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AccionesAuditoriaService } from './acciones-auditoria.service';

@UseGuards(JwtAuthGuard)
@Controller('auditoria/acciones')
export class AccionesAuditoriaController {
  constructor(
    private readonly accionesSvc: AccionesAuditoriaService,
  ) {}

  @Get()
  async listar(
    @Query('citaId') citaId?: string,
    @Query('limit') limit?: string,
  ) {
    const citaIdNum =
      citaId && !Number.isNaN(Number(citaId)) ? Number(citaId) : undefined;
    const limitNum = limit && !Number.isNaN(Number(limit)) ? Number(limit) : undefined;

    return this.accionesSvc.listar({
      citaId: citaIdNum,
      limit: limitNum,
    });
  }
}
