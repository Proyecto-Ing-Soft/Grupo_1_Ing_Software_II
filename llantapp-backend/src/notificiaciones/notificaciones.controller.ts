// src/notificaciones/notificaciones.controller.ts
import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { NotificacionesService } from './servicio/notificaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // ajusta path a tu proyecto

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly servicio: NotificacionesService) {}

  @Get('mias')
  mias(@Req() req: any) {
    return this.servicio.listarMias(req.user.id);
  }

  @Post(':id/marcar-leida')
  async marcar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const uid = req.user?.id ?? req.user?.sub;
    return this.servicio.marcarLeida(id, Number(uid));
  }
}
