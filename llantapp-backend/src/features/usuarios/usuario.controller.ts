import {
  Controller,
  Get,
  Req,
  UseGuards,
  NotFoundException,
  Query,
  Delete,
  ParseIntPipe,
  Param,
  Put,
  Body,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuariosPorRolQueryDto } from './dto/usuarios-por-rol.dto';

// SRP: este controlador orquesta HTTP ⇄ UsuarioService sin conocer detalles de persistencia.
type ActualizarUsuarioTallerDto = {
  nombreCompleto?: string;
  correo?: string;
  rol?: string; // código de rol (ej. 'ADMIN_TALLER', 'MECANICO'), validado contra BD en el servicio.
};

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarios: UsuarioService) {}

  // Perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('yo')
  async yo(@Req() req: any) {
    const uid = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(uid)) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const slugTaller =
      req.user?.slugTaller ??
      req.user?.tallerSlug ??
      req.user?.tenant ??
      req.headers?.['x-slug-taller'] ??
      req.headers?.['x-tenant'];

    if (!slugTaller || typeof slugTaller !== 'string') {
      throw new NotFoundException('Taller (slug) no encontrado en el token o encabezados');
    }

    const usuario = await this.usuarios.buscarPorId(slugTaller, uid);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.usuarios.aPublico(usuario);
  }

  // Lista usuarios por rol (rol.codigo en BD)
  @UseGuards(JwtAuthGuard)
  @Get()
  async porRol(@Req() req: any, @Query() q: UsuariosPorRolQueryDto) {
    if (!q.rol) return [];

    const slugTaller =
      req.user?.slugTaller ??
      req.user?.tallerSlug ??
      req.user?.tenant ??
      req.headers?.['x-slug-taller'] ??
      req.headers?.['x-tenant'];

    if (!slugTaller || typeof slugTaller !== 'string') {
      throw new NotFoundException('Taller (slug) no encontrado en el token o encabezados');
    }

    return this.usuarios.listarPorRol(slugTaller, q.rol);
  }

  // Personal del taller (ej. ADMIN_TALLER, MECANICO)
  @UseGuards(JwtAuthGuard)
  @Get('taller')
  async listarTaller(@Req() req: any) {
    const slugTaller =
      req.user?.slugTaller ??
      req.user?.tallerSlug ??
      req.user?.tenant ??
      req.headers?.['x-slug-taller'] ??
      req.headers?.['x-tenant'];

    if (!slugTaller || typeof slugTaller !== 'string') {
      throw new NotFoundException('Taller (slug) no encontrado en el token o encabezados');
    }

    return this.usuarios.listarTaller(slugTaller);
  }

  // Actualizar datos / rol de personal de taller
  @UseGuards(JwtAuthGuard)
  @Put('taller/:id')
  async actualizarPersonalTaller(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioTallerDto,
  ) {
    const slugTaller =
      req.user?.slugTaller ??
      req.user?.tallerSlug ??
      req.user?.tenant ??
      req.headers?.['x-slug-taller'] ??
      req.headers?.['x-tenant'];

    if (!slugTaller || typeof slugTaller !== 'string') {
      throw new NotFoundException('Taller (slug) no encontrado en el token o encabezados');
    }

    return this.usuarios.actualizarPersonalTaller(slugTaller, id, dto);
  }

  // Eliminar personal de taller
  @UseGuards(JwtAuthGuard)
  @Delete('taller/:id')
  async eliminarPersonalTaller(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const slugTaller =
      req.user?.slugTaller ??
      req.user?.tallerSlug ??
      req.user?.tenant ??
      req.headers?.['x-slug-taller'] ??
      req.headers?.['x-tenant'];

    if (!slugTaller || typeof slugTaller !== 'string') {
      throw new NotFoundException('Taller (slug) no encontrado en el token o encabezados');
    }

    await this.usuarios.eliminarPersonalTaller(slugTaller, id);
    return { ok: true };
  }
}
