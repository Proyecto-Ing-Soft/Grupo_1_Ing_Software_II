import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { BitacoraService } from './bitacora.service';
import { FiltrarBitacoraDto } from './dto/filtrar-bitacora.dto';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones/bitacora')
export class BitacoraController {
  constructor(private readonly svc: BitacoraService) {}

  private assertAdmin(req: any) {
    if (req.user?.rol !== 'ADMIN_TALLER' && req.user?.rol !== 'OWNER') {
      throw new ForbiddenException('Solo administración de taller');
    }
  }
  private getSlugTaller(req: any): string {
    const headerSlug = req.headers['x-taller-slug'] as string | undefined;
    const slug = headerSlug?.trim() || (req.user?.tallerSlug as string | undefined)?.trim();
    if (!slug) throw new BadRequestException('Debe especificarse el taller mediante header x-taller-slug');
    return slug;
  }

  @Post('buscar')
  buscar(@Body() filtros: FiltrarBitacoraDto, @Req() req: any) {
    this.assertAdmin(req);
    const slug = this.getSlugTaller(req);
    return this.svc.buscar(slug, filtros);
  }

  @Get(':id')
  detalle(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.assertAdmin(req);
    return this.svc.detalle(id);
  }
}
