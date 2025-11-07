// PRINCIPIOS:
// - SRP: solo orquesta HTTP ⇄ Service. Nada de reglas de negocio aquí.
// - DRY: delega todo en CitasService, evitando duplicar validaciones.
// - Demeter: el controller solo “conoce” a su Service (no navega por capas internas).
// - Seguridad por capas: aquí puedes aplicar Jwt/RolesGuard sin tocar el Service (OCP).

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { AsignarMecanicoDto } from '../asignaciones/dto/asignar-mecanico.dto';

@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly svc: CitasService) {}

  // === CLIENTE: crear cita ===
  @Post()
  async crear(@Body() dto: CrearCitaDto, @Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new UnauthorizedException('Usuario no válido');
    return await this.svc.crear(dto, clienteId);
  }

  // === ADMIN: asignar mecánico ===
  @Post(':id/asignar')
  async asignar(
    @Param('id', ParseIntPipe) citaId: number,
    @Body() dto: AsignarMecanicoDto,
    @Req() req: any,
  ) {
    const adminId = Number(req.user?.id ?? req.user?.sub);
    const rol = req.user?.rol ?? req.user?.roles?.[0];
    if (rol !== 'ADMIN_TALLER' && rol !== 'ADMIN')
      throw new ForbiddenException('Solo administradores pueden asignar mecánicos');
    return await this.svc.asignarMecanico(citaId, dto.mecanicoId, adminId);
  }

  // === MECÁNICO: marcar cita como terminada ===
  @Post(':id/terminar')
  async terminar(@Param('id', ParseIntPipe) citaId: number, @Req() req: any) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) throw new UnauthorizedException('Usuario no válido');
    return await this.svc.terminar(citaId, mecanicoId);
  }

  // === CLIENTE: listar sus citas ===
  @Get('mias')
  async mias(@Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new UnauthorizedException('Usuario no válido');
    return await this.svc.listarDelCliente(clienteId);
  }

  // === MECÁNICO: listar citas asignadas ===
  @Get('asignadas')
  async asignadas(@Req() req: any) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) throw new UnauthorizedException('Usuario no válido');
    return await this.svc.listarDelMecanico(mecanicoId);
  }

  // === ADMIN: listar pendientes ===
  @Get('admin/pendientes')
  async pendientes(@Req() req: any) {
    const rol = req.user?.rol ?? req.user?.roles?.[0];
    if (rol !== 'ADMIN_TALLER' && rol !== 'ADMIN')
      throw new ForbiddenException('Solo administradores pueden ver pendientes');
    return await this.svc.listarPendientes();
  }

  // === DETALLE DE CITA ===
  @Get(':id')
  async detalle(@Param('id', ParseIntPipe) citaId: number) {
    const c = await this.svc.buscarPorIdConVehiculo(citaId);
    if (!c) throw new NotFoundException('Cita no encontrada');

    return {
      id: c.id,
      fechaProgramada: c.fechaProgramada,
      prioridad: c.prioridad,
      comentariosCliente: c.comentariosCliente,
      estado: c.estadoCita?.nombre,
      servicio: c.servicio?.nombre,
      vehiculo: c.vehiculo
        ? {
            placa: c.vehiculo.placa,
            alias: c.vehiculo.alias,
          }
        : null,
      cliente: c.clienteUsuario
        ? {
            id: c.clienteUsuario.id,
            nombres: c.clienteUsuario.nombres,
            apellidos: c.clienteUsuario.apellidos,
          }
        : null,
    };
  }
}
