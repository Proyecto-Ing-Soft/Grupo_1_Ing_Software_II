// PRINCIPIOS:
// - SRP: sólo orquesta HTTP ⇄ Service.
// - KISS: endpoints mínimos (crear + listar por vehículo).
// - Seguridad por capas: Jwt + reglas de permiso en el servicio.

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IntervencionesExternasService } from './intervenciones-externas.service';
import { CrearIntervencionExternaDto } from './dto/crear-intervencion-externa.dto';

@UseGuards(JwtAuthGuard)
@Controller('intervenciones-externas')
export class IntervencionesExternasController {
  constructor(private readonly svc: IntervencionesExternasService) {}

  // POST /intervenciones-externas
  // Cliente registra intervención externa de uno de sus vehículos
  @Post()
  async crear(@Body() dto: CrearIntervencionExternaDto, @Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(userId)) {
      throw new Error('Usuario no válido');
    }
    return this.svc.crear(dto, userId);
  }

  // GET /intervenciones-externas/vehiculo/:vehiculoId
  // Historial de intervenciones externas de un vehículo
  @Get('vehiculo/:vehiculoId')
  async listarPorVehiculo(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Req() req: any,
  ) {
    const userId = Number(req.user?.id ?? req.user?.sub);
    const rol = req.user?.rol;
    return this.svc.listarPorVehiculo(vehiculoId, userId, rol);
  }
}
