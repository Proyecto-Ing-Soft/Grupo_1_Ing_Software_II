import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IntervencionesService } from './intervenciones.service';
import { CrearIntervencionExternaDto } from './dto/crear-intervencion-externa.dto';

@UseGuards(JwtAuthGuard)
@Controller('intervenciones')
export class IntervencionesController {
  constructor(private readonly svc: IntervencionesService) {}

  private getSlugTaller(req: any): string {
    const headerSlug = req.headers['x-taller-slug'] as string | undefined;
    const slug = headerSlug?.trim() || (req.user?.tallerSlug as string | undefined)?.trim();
    if (!slug) throw new BadRequestException('Debe especificarse el taller mediante header x-taller-slug');
    return slug;
  }

  @Post()
  crear(@Body() dto: CrearIntervencionExternaDto, @Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new BadRequestException('Usuario no válido');
    const slug = this.getSlugTaller(req);
    return this.svc.crear(dto, clienteId, slug);
  }

  @Get('mias')
  mias(@Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new BadRequestException('Usuario no válido');
    return this.svc.listarDelCliente(clienteId);
  }

  @Get('vehiculo/:vehiculoId')
  porVehiculo(@Param('vehiculoId', ParseIntPipe) vehiculoId: number) {
    return this.svc.listarPorVehiculo(vehiculoId);
  }
}
