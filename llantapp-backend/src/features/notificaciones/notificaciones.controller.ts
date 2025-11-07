import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// PRINCIPIO (SRP): extrae usuario/taller y delega la lógica al servicio.

type JwtUser = {
  id: number;
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

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly servicio: NotificacionesService) {}

  @Get('mias')
  async mias(@Req() req: RequestWithUser) {
    const uid = req.user.id;
    const slug = getSlugTaller(req);
    return this.servicio.listarPorUsuario(slug, uid);
  }

  @Post(':id/marcar-leida')
  async marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const uid = req.user.id;
    const slug = getSlugTaller(req);
    return this.servicio.marcarLeida(slug, id, uid);
  }
}
