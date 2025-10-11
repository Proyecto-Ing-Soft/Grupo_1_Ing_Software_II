import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionDto } from './dto/calificacion.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('calificaciones')
@UseGuards(JwtAuthGuard)
export class CalificacionesController {
  constructor(private readonly svc: CalificacionesService) {}

  // -------- LISTADOS PRIMERO (para que no choquen con :citaId) --------
  @Get()
  async _doc() { return { ok: true }; } // opcional

  // CLIENTE
  @Get('mias')
  async mias(
    @Req() req: any,
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
  ) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new UnauthorizedException('Usuario no válido');

    const page = Math.max(1, parseInt(pageQ ?? '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(pageSizeQ ?? '10', 10) || 10));

    return this.svc.miasCliente(clienteId, page, pageSize);
  }

  // MECÁNICO
  @Get('recibidas')
  async recibidas(
    @Req() req: any,
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
  ) {
    const mecanicoId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(mecanicoId)) throw new UnauthorizedException('Usuario no válido');

    const page = Math.max(1, parseInt(pageQ ?? '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(pageSizeQ ?? '10', 10) || 10));

    return this.svc.recibidasMecanico(mecanicoId, page, pageSize);
  }

  // --------------------- DETALLE POR CITA (al final) -------------------
  @Get('cita/:citaId')
  async leer(@Param('citaId', ParseIntPipe) citaId: number, @Req() req: any) {
    const solicitanteId = Number(req.user?.id ?? req.user?.sub);
    const rol = req.user?.rol ?? req.user?.role;
    if (!Number.isFinite(solicitanteId)) throw new UnauthorizedException('Usuario no válido');
    return this.svc.leerPorCita(citaId, solicitanteId, rol);
  }

  // --------------------------- CREAR -----------------------------------
  @Post()
  async crear(@Body() body: { citaId: number } & CalificacionDto, @Req() req: any) {
    const clienteId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(clienteId)) throw new UnauthorizedException('Usuario no válido');

    return this.svc.crear(Number(body.citaId), clienteId, {
      estrellas: body.estrellas,
      comentario: body.comentario,
    });
  }

  @Get('admin')
  async adminList(
    @Req() req: any,
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
    @Query('mecanicoId') mecanicoIdQ?: string,
    @Query('estrellas') estrellasQ?: string,
    @Query('desde') desdeQ?: string,
    @Query('hasta') hastaQ?: string,
    @Query('placa') placaQ?: string,
  ) {
    if ((req.user?.rol ?? req.user?.role) !== 'ADMIN') {
      throw new ForbiddenException('Solo ADMIN');
    }
    const page = Math.max(1, parseInt(pageQ ?? '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(pageSizeQ ?? '10', 10) || 10));
    const filtros = {
      mecanicoId: mecanicoIdQ ? Number(mecanicoIdQ) : undefined,
      estrellas: estrellasQ ? Number(estrellasQ) : undefined,
      desde: desdeQ ? new Date(desdeQ) : undefined,
      hasta: hastaQ ? new Date(hastaQ) : undefined,
      placa: placaQ?.trim() || undefined,
    };
    return this.svc.adminList(page, pageSize, filtros);
  }

  // --- NUEVO: ADMIN – estadísticas rápidas ---
  @Get('admin/stats')
  async adminStats(@Req() req: any) {
    if ((req.user?.rol ?? req.user?.role) !== 'ADMIN') {
      throw new ForbiddenException('Solo ADMIN');
    }
    return this.svc.adminStats();
  }

}

