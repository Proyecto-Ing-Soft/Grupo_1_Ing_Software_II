import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// PRINCIPIO (SRP): este controlador solo orquesta HTTP → servicio de historial.

type JwtUser = {
  id: number;
  rol?: string;
  tallerSlug?: string;
  [k: string]: any;
};

type RequestWithUser = Request & { user: JwtUser };

function getSlugTaller(req: RequestWithUser): string {
  const header = (req.headers['x-taller-slug'] as string | undefined)?.trim();
  const fromUser =
    typeof req.user?.tallerSlug === 'string'
      ? req.user.tallerSlug.trim()
      : undefined;

  const slug = header || fromUser;

  if (!slug) {
    throw new BadRequestException(
      'Falta el identificador del taller (x-taller-slug)',
    );
  }

  return slug;
}

@Controller('historial')
export class HistorialController {
  constructor(private readonly historial: HistorialService) {}

  @UseGuards(JwtAuthGuard)
  @Get('vehiculo/:vehiculoId')
  async porVehiculo(
    @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
    @Req() req: RequestWithUser,
  ) {
    const usuario = req.user;

    return this.historial.historialPorVehiculo(getSlugTaller(req), vehiculoId, {
      id: usuario.id,
      rol: String(usuario.rol ?? ''),
    });
  }
}
