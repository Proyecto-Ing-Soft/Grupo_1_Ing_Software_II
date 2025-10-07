// src/citas/citas.controller.ts

// PRINCIPIOS:
// - SRP: solo orquesta HTTP ⇄ Service. Nada de reglas de negocio aquí.
// - DRY: delega todo en CitasService, evitando duplicar validaciones.
// - Demeter: el controller solo “conoce” a su Service (no navega por capas internas).
// - Seguridad por capas: aquí puedes aplicar Jwt/RolesGuard sin tocar el Service (OCP).
// src/citas/citas.controller.ts
// src/citas/citas.controller.ts
import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { AsignarMecanicoDto } from './dto/asignar-mecanico.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('citas-mantenimiento')
export class CitasController {
  constructor(private readonly svc: CitasService) {}

  @Post()
  crear(@Body() dto: CrearCitaDto, @Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub); // 👈 lee id o sub
    if (!Number.isFinite(userId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.crear(dto, userId);
  }

  @Post(':id/asignar')
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarMecanicoDto,
    @Req() req: any,
  ) {
    const adminId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(adminId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.asignarMecanico(id, dto.mecanicoId, adminId);
  }

  @Post(':id/terminar')
  terminar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.terminar(id, mecanicoId);
  }

  @Get('mias')
  mias(@Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.listarDelCliente(clienteId);
  }

  @Get('asignadas')
  asignadas(@Req() req: any) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.listarDelMecanico(mecanicoId);
  }

  @Get('admin/pendientes')
    pendientes(@Req() req: any) {
      if (req.user?.rol !== 'ADMIN') throw new ForbiddenException('Solo admin');
      return this.svc.listarPendientes();
    }

}
