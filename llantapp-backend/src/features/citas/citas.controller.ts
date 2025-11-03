// PRINCIPIOS:
// - SRP: solo orquesta HTTP ⇄ Service. Nada de reglas de negocio aquí.
// - DRY: delega todo en CitasService, evitando duplicar validaciones.
// - Demeter: el controller solo “conoce” a su Service (no navega por capas internas).
// - Seguridad por capas: aquí puedes aplicar Jwt/RolesGuard sin tocar el Service (OCP).

import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Post, Req, StreamableFile, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { AsignarMecanicoDto } from '../asignaciones/dto/asignar-mecanico.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('citas-mantenimiento')
export class CitasController {
  constructor(private readonly svc: CitasService) {}

  @Post()
  crear(@Body() dto: CrearCitaDto, @Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub);
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
  terminar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { trabajosRealizados?: string; repuestos?: string[]; evidenciaBase64?: string | null },
    @Req() req: any,
  ) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.terminar(id, mecanicoId, dto);
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

  @Get(':id')
  async detalle(@Param('id', ParseIntPipe) id: number) {
    const c = await this.svc.buscarPorIdConVehiculo(id);
    if (!c) throw new NotFoundException('Cita no encontrada');

    return {
      id: c.id,
      clienteId: c.clienteId ?? null,
      programadaPara: c.programadaPara ?? null,

      vehiculo: c.vehiculo
        ? {
            placa: c.vehiculo.placa ?? null,
            marca: c.vehiculo.marca ?? null,
            modelo: c.vehiculo.modelo ?? null,
            anio: c.vehiculo.anio ?? null,
            color: c.vehiculo.color ?? null,
            vin: c.vehiculo.vin ?? null,
          }
        : null,

      placaPreliminar: c.placaPreliminar ?? null,
      marcaPreliminar: c.marcaPreliminar ?? null,
      modeloPreliminar: c.modeloPreliminar ?? null,
      anioPreliminar: c.anioPreliminar ?? null,
      colorPreliminar: c.colorPreliminar ?? null,
      vinPreliminar: c.vinPreliminar ?? null,

      trabajosRealizados: (c as any).trabajosRealizados ?? null,

      evidenciaDisponible: Boolean((c as any).evidenciaMime || (c as any).evidenciaNombre),
    };
  }


  @Get(':id/evidencia')
  async evidencia(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    const c = await this.svc.buscarPorIdConVehiculo(id);
    if (!c || !c.evidenciaBytes) throw new NotFoundException('Sin evidencia');

    const mime = (c as any).evidenciaMime ?? 'application/octet-stream';
    const name = (c as any).evidenciaNombre ?? `evidencia-${id}`;

    return new StreamableFile(Buffer.from(c.evidenciaBytes as any), {
      type: mime,
      disposition: `inline; filename="${name}"`,
    });
  }
}
