import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { EnviarPromocionDto } from './dto/enviar-promocion.dto';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly servicio: NotificacionesService) {}

  @Get('mias')
  async mias(@Req() req: any) {
    const uidRaw = req.user?.sub ?? req.user?.id;
    const uid = Number(uidRaw);
    return this.servicio.listarPorUsuario(uid);
  }

  @Post(':id/marcar-leida')
  async marcarLeida(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const uidRaw = req.user?.sub ?? req.user?.id;
    const uid = Number(uidRaw);
    return this.servicio.marcarLeida(id, uid);
  }

  // === US-04: Enviar promociones personalizadas (solo ADMIN) ===
  @Post('admin/promociones')
  async enviarPromocion(@Req() req: any, @Body() dto: EnviarPromocionDto) {
    if (req.user?.rol !== 'ADMIN') {
      throw new ForbiddenException('Solo admin puede enviar promociones');
    }
    return this.servicio.enviarPromocionATodosClientes(dto);
  }
}
