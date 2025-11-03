// src/historial/historial.controller.ts
import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Rol } from '../../common/enums/rol.enum'

type JwtUser = { id: number; rol: Rol; [k: string]: any };
type RequestWithUser = Request & { user: JwtUser };

@Controller('historial')
export class HistorialController {
  constructor(private readonly historial: HistorialService) {}

  @UseGuards(JwtAuthGuard)
  @Get('vehiculo/:vehiculoId')
  async porVehiculo(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Req() req: RequestWithUser
  ) {
    const usuario = req.user;
    return this.historial.historialPorVehiculo(vehiculoId, { id: usuario.id, rol: usuario.rol });
  }
}
