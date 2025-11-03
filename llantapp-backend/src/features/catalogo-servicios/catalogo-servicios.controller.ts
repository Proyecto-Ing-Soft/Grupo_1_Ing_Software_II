// PRINCIPIOS
// - SRP: orquesta HTTP ⇄ Service (sin reglas de dominio).
// - Seguridad: JwtAuthGuard + RolesGuard + @RolRequerido.
// - OCP: fácil de extender con más endpoints.

import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolRequerido } from '../../common/decorators/rol-requerido.decorator';
import { Rol } from '../../common/enums/rol.enum';
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

  // === ADMIN: Crear servicio ===
  @RolRequerido(Rol.ADMIN)
  @Post()
  crear(@Body() dto: CrearServicioDto) {
    return this.svc.crear(dto);
  }

  // === ADMIN: Actualizar servicio ===
  @RolRequerido(Rol.ADMIN)
  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarServicioDto) {
    return this.svc.actualizar(id, dto);
  }

  // === ADMIN: Cambiar estado (activar/inactivar) ===
  @RolRequerido(Rol.ADMIN)
  @Patch(':id/estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto) {
    return this.svc.cambiarEstado(id, dto.activo);
  }

  // === Listar: autenticados (si quieres, puedes exigir ADMIN) ===
  @Get()
  listar(@Query('q') q?: string, @Query('activo') activo?: string) {
    const onlyActive = typeof activo === 'string' ? activo.toLowerCase() === 'true' : undefined;
    return this.svc.listar({ q, activo: onlyActive });
  }

  // === Detalle: autenticados ===
  @Get(':id')
  detalle(@Param('id', ParseIntPipe) id: number) {
    return this.svc.detalle(id);
  }

  // === ADMIN: Habilitar/Deshabilitar mecánico para un servicio ===
  @RolRequerido(Rol.ADMIN)
  @Post(':id/habilitar-mecanico')
  habilitarMecanico(
    @Param('id', ParseIntPipe) servicioId: number,
    @Body() dto: HabilitarMecanicoDto,
  ) {
    return this.svc.setHabilitacion(servicioId, dto.mecanicoId, dto.habilitado ?? true);
  }

  // === ADMIN: Ver mecánicos habilitados del servicio ===
  @RolRequerido(Rol.ADMIN)
  @Get(':id/mecanicos')
  mecanicos(@Param('id', ParseIntPipe) servicioId: number) {
    return this.svc.listarMecanicosHabilitados(servicioId);
  }
}
