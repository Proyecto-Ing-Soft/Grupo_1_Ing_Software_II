import { Controller, Get, Post, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly servicio: NotificacionesService) {}

  @Get('mias')
  async mias(@Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.servicio.listarPorUsuario(uid);
  }

  @Post(':id/marcar-leida')
  async marcarLeida(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.servicio.marcarLeida(id, uid);
  }
}
