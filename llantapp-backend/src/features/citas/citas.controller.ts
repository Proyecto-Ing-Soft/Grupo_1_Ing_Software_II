// PRINCIPIOS:
// - SRP: el controlador solo orquesta HTTP ⇄ CitasService.
// - Demeter: conoce solo a CitasService y a los guards, no a detalles de infraestructura.
// - Seguridad por capas: JwtAuthGuard se aplica aquí, la lógica de dominio vive en el servicio.

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  StreamableFile,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { AsignarMecanicoDto } from '../asignaciones/dto/asignar-mecanico.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly svc: CitasService) {}

  private getSlugTaller(req: any): string {
    const headerSlug = req.headers['x-taller-slug'] as string | undefined;
    const slug = headerSlug?.trim() || (req.user?.tallerSlug as string | undefined)?.trim();
    if (!slug) {
      throw new BadRequestException('Debe especificarse el taller mediante header x-taller-slug');
    }
    return slug;
  }

  @Post()
  crear(@Body() dto: CrearCitaDto, @Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    const slugTaller = this.getSlugTaller(req);
    return this.svc.crear(dto, clienteId, slugTaller);
  }

  @Post(':id/asignar')
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarMecanicoDto,
    @Req() req: any,
  ) {
    const adminId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(adminId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    if (req.user?.rol !== 'ADMIN_TALLER' && req.user?.rol !== 'OWNER') {
      throw new ForbiddenException('Solo administración de taller puede asignar mecánicos');
    }
    const slugTaller = this.getSlugTaller(req);
    return this.svc.asignarMecanico(id, dto.mecanicoId, adminId, slugTaller);
  }

  @Post(':id/finalizar')
  finalizar(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      trabajosRealizados?: string;
      repuestos?: string[];
      evidenciaBase64?: string | null;
    },
    @Req() req: any,
  ) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    const slugTaller = this.getSlugTaller(req);
    return this.svc.finalizar(id, mecanicoId, dto, slugTaller);
  }

  @Get('mias')
  mias(@Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return this.svc.listarDelCliente(clienteId);
  }

  @Get('asignadas')
  asignadas(@Req() req: any) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return this.svc.listarDelMecanico(mecanicoId);
  }

  @Get('admin/pendientes')
  pendientes(@Req() req: any) {
    if (req.user?.rol !== 'ADMIN_TALLER' && req.user?.rol !== 'OWNER') {
      throw new ForbiddenException('Solo administración de taller puede ver pendientes');
    }
    return this.svc.listarPendientes();
  }

  @Get(':id')
  async detalle(@Param('id', ParseIntPipe) id: number) {
    const cita = await this.svc.buscarPorIdConVehiculo(id);
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }
    return cita;
  }

  @Get(':id/evidencia')
  async evidencia(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    const blob = await this.svc.obtenerEvidencia(id);
    if (!blob) {
      throw new NotFoundException('Sin evidencia para esta cita');
    }

    return new StreamableFile(blob.buffer, {
      type: blob.mime,
      disposition: `inline; filename="${blob.nombre}"`,
    });
  }
}
