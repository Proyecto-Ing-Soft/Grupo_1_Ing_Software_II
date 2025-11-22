// PRINCIPIOS:
// - SRP: solo orquesta HTTP <-> Service.
// - Seguridad: solo OWNER puede listar/aprobar/rechazar.
// - KISS: rutas claras.

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SolicitudesTallerService } from './solicitudes-taller.service';
import {
  CrearSolicitudTallerDto,
  RechazarSolicitudTallerDto,
} from './dto/crear-solicitud-taller.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('solicitudes-taller')
export class SolicitudesTallerController {
  constructor(private readonly svc: SolicitudesTallerService) {}

  // === PÚBLICO: cualquiera puede enviar solicitud ===
  @Post()
  crear(@Body() dto: CrearSolicitudTallerDto) {
    return this.svc.crear(dto);
  }

  // === OWNER: ver solicitudes pendientes ===
  @UseGuards(JwtAuthGuard)
  @Get('pendientes')
  listarPendientes(@Req() req: any) {
    if (req.user?.rol !== 'OWNER') {
      throw new ForbiddenException('Solo owner puede ver solicitudes');
    }
    return this.svc.listarPendientes();
  }

  // === OWNER: aprobar ===
  @UseGuards(JwtAuthGuard)
  @Post(':id/aprobar')
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    if (req.user?.rol !== 'OWNER') {
      throw new ForbiddenException('Solo owner puede aprobar solicitudes');
    }
    const ownerId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(ownerId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return this.svc.aprobar(id, ownerId);
  }

  // === OWNER: rechazar ===
  @UseGuards(JwtAuthGuard)
  @Post(':id/rechazar')
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarSolicitudTallerDto,
    @Req() req: any,
  ) {
    if (req.user?.rol !== 'OWNER') {
      throw new ForbiddenException('Solo owner puede rechazar solicitudes');
    }
    const ownerId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(ownerId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return this.svc.rechazar(id, dto, ownerId);
  }
}
