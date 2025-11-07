// SRP: controlador HTTP del catálogo de servicios; delega en el servicio de dominio.
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolRequerido } from '../../common/decorators/rol-requerido.decorator';
import { CatalogoServiciosService } from './catalogo-servicios.service';
import {
  ActualizarServicioDto,
  CambiarEstadoDto,
  CrearServicioDto,
  HabilitarMecanicoDto,
} from './dto/servicio.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalogo-servicios')
export class CatalogoServiciosController {
  constructor(private readonly svc: CatalogoServiciosService) {}

  // DIP: obtenemos el taller desde el request sin acoplar endpoints a un tenant fijo.
  private getSlugTaller(req: any): string {
    const headerSlug = req.headers['x-taller-slug'] as
      | string
      | undefined;
    const slug =
      headerSlug?.trim() ||
      (req.user?.tallerSlug as string | undefined)?.trim();
    if (!slug) {
      throw new BadRequestException(
        'Debe especificarse el taller mediante header x-taller-slug',
      );
    }
    return slug;
  }

  // === ADMIN/OWNER: Crear servicio ===
  @RolRequerido('OWNER', 'ADMIN_TALLER')
  @Post()
  crear(@Req() req: any, @Body() dto: CrearServicioDto) {
    const slugTaller = this.getSlugTaller(req);
    return this.svc.crear(slugTaller, dto);
  }

  // === ADMIN/OWNER: Actualizar servicio ===
  @RolRequerido('OWNER', 'ADMIN_TALLER')
  @Put(':id')
  actualizar(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarServicioDto,
  ) {
    const slugTaller = this.getSlugTaller(req);
    return this.svc.actualizar(slugTaller, id, dto);
  }

  // === ADMIN/OWNER: Cambiar estado (activar/inactivar) ===
  @RolRequerido('OWNER', 'ADMIN_TALLER')
  @Patch(':id/estado')
  cambiarEstado(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
  ) {
    const slugTaller = this.getSlugTaller(req);
    return this.svc.cambiarEstado(slugTaller, id, dto.activo);
  }

  // === Listar servicios del taller (autenticados) ===
  @Get()
  listar(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('activo') activo?: string,
  ) {
    const slugTaller = this.getSlugTaller(req);
    const onlyActive =
      typeof activo === 'string'
        ? activo.toLowerCase() === 'true'
        : undefined;
    return this.svc.listar(slugTaller, {
      q,
      activo: onlyActive,
    });
  }

  // === Detalle de servicio (autenticados) ===
  @Get(':id')
  detalle(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const slugTaller = this.getSlugTaller(req);
    return this.svc.detalle(slugTaller, id);
  }

  // === ADMIN/OWNER: Habilitar/Deshabilitar mecánico para un servicio ===
  @RolRequerido('OWNER', 'ADMIN_TALLER')
  @Post(':id/habilitar-mecanico')
  habilitarMecanico(
    @Req() req: any,
    @Param('id', ParseIntPipe) servicioId: number,
    @Body() dto: HabilitarMecanicoDto,
  ) {
    const slugTaller = this.getSlugTaller(req);
    return this.svc.setHabilitacion(
      slugTaller,
      servicioId,
      dto.mecanicoId,
      dto.habilitado ?? true,
    );
  }

  // === ADMIN/OWNER: Ver mecánicos asociados al servicio ===
  @RolRequerido('OWNER', 'ADMIN_TALLER')
  @Get(':id/mecanicos')
  mecanicos(
    @Req() req: any,
    @Param('id', ParseIntPipe) servicioId: number,
  ) {
    const slugTaller = this.getSlugTaller(req);
    return this.svc.listarMecanicosHabilitados(
      slugTaller,
      servicioId,
    );
  }
}
