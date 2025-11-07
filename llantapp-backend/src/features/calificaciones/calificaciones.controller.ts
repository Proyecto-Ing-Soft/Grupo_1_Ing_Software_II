import {
  BadRequestException,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// SRP: expone endpoints de calificaciones de citas, delegando reglas al servicio.
@Controller('calificaciones')
@UseGuards(JwtAuthGuard)
export class CalificacionesController {
  constructor(private readonly svc: CalificacionesService) {}

  @Get()
  async _doc() {
    return { ok: true };
  }

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

  private getUsuarioId(req: any): number {
    const id =
      req.user?.id ?? req.user?.sub;
    const num = Number(id);
    if (!Number.isFinite(num)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return num;
  }

  private getRol(req: any): string | undefined {
    return (req.user?.rol ??
      req.user?.role)?.toString();
  }

  // ------------------- CLIENTE: MIS CALIFICACIONES --------------------
  @Get('mias')
  async mias(
    @Req() req: any,
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
  ) {
    const slugTaller = this.getSlugTaller(req);
    const clienteId = this.getUsuarioId(req);

    const page = Math.max(1, parseInt(pageQ ?? '1', 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(pageSizeQ ?? '10', 10) || 10),
    );

    return this.svc.miasCliente(
      slugTaller,
      clienteId,
      page,
      pageSize,
    );
  }

  // ------------------- MECÁNICO: CALIFICACIONES RECIBIDAS -------------
  @Get('recibidas')
  async recibidas(
    @Req() req: any,
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
  ) {
    const slugTaller = this.getSlugTaller(req);
    const mecanicoId = this.getUsuarioId(req);

    const page = Math.max(1, parseInt(pageQ ?? '1', 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(pageSizeQ ?? '10', 10) || 10),
    );

    return this.svc.recibidasMecanico(
      slugTaller,
      mecanicoId,
      page,
      pageSize,
    );
  }

  // ------------------- DETALLE POR CITA -------------------------------
  @Get('cita/:citaId')
  async leer(
    @Param('citaId', ParseIntPipe) citaId: number,
    @Req() req: any,
  ) {
    const slugTaller = this.getSlugTaller(req);
    const solicitanteId = this.getUsuarioId(req);
    const rol = this.getRol(req);

    return this.svc.leerPorCita(
      slugTaller,
      citaId,
      solicitanteId,
      rol,
    );
  }

  // ------------------- CREAR CALIFICACIÓN POR CITA --------------------
  @Post()
  async crear(
    @Body()
    body: { citaId: number } & CalificacionDto,
    @Req() req: any,
  ) {
    const slugTaller = this.getSlugTaller(req);
    const clienteId = this.getUsuarioId(req);

    const citaId = Number(body.citaId);
    if (!Number.isFinite(citaId)) {
      throw new BadRequestException('citaId inválido');
    }

    return this.svc.crear(
      slugTaller,
      citaId,
      clienteId,
      {
        estrellas: body.estrellas,
        comentario: body.comentario,
      },
    );
  }

  // ------------------- ADMIN: LISTADO FILTRADO ------------------------
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
    const slugTaller = this.getSlugTaller(req);
    const rol = this.getRol(req);
    if (!this.svc.esRolAdmin(rol)) {
      throw new ForbiddenException(
        'No tienes permisos para esta operación',
      );
    }

    const page = Math.max(1, parseInt(pageQ ?? '1', 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(pageSizeQ ?? '10', 10) || 10),
    );

    const filtros = {
      mecanicoId: mecanicoIdQ
        ? Number(mecanicoIdQ)
        : undefined,
      estrellas: estrellasQ
        ? Number(estrellasQ)
        : undefined,
      desde: desdeQ ? new Date(desdeQ) : undefined,
      hasta: hastaQ ? new Date(hastaQ) : undefined,
      placa: placaQ?.trim() || undefined,
    };

    return this.svc.adminList(
      slugTaller,
      page,
      pageSize,
      filtros,
    );
  }

  // ------------------- ADMIN: ESTADÍSTICAS ----------------------------
  @Get('admin/stats')
  async adminStats(@Req() req: any) {
    const slugTaller = this.getSlugTaller(req);
    const rol = this.getRol(req);
    if (!this.svc.esRolAdmin(rol)) {
      throw new ForbiddenException(
        'No tienes permisos para esta operación',
      );
    }
    return this.svc.adminStats(slugTaller);
  }
}
