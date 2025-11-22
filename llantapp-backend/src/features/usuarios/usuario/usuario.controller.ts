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
  BadRequestException,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UsuariosPorRolQueryDto } from './dto/usuarios-por-rol.dto';
import { Rol as AppRol } from '../../../common/enums/rol.enum';

type ActualizarUsuarioTallerDto = {
  nombreCompleto?: string;
  correo?: string;
  rol?: 'ADMIN' | 'MECANICO';
};

type CambiarClaveTallerDto = {
  nuevaClave: string;
};

@Controller('usuarios')
export class UsuarioController {
  constructor(private usuarios: UsuarioService) {}

  // Endpoint existente: devuelve el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('yo')
  async yo(@Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    const usuario = await this.usuarios.buscarPorId(uid);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.usuarios.aPublico(usuario);
  }

  // =========================
  // Listar usuarios por rol (limitado a mi taller)
  //    GET /usuarios?rol=MECANICO&soloActivos=true
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get()
  async porRol(@Req() req: any, @Query() q: UsuariosPorRolQueryDto & { soloActivos?: string }) {
    if (!q.rol) return [];

    const uid = req.user?.sub ?? req.user?.id;
    const soloActivos = q.soloActivos === 'true';
    return this.usuarios.listarPorRolEnTaller(q.rol, uid, soloActivos);
  }

  // =========================
  // Gestión de personal del taller (solo mi taller)
  // =========================

  // Lista ADMIN + MECÁNICO SOLO de mi taller
  @UseGuards(JwtAuthGuard)
  @Get('taller')
  async listarTaller(@Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.usuarios.listarPersonalDeTallerDeAdmin(uid);
  }

  // Actualizar personal del taller (solo ADMIN/MECÁNICO de MI taller)
  @UseGuards(JwtAuthGuard)
  @Put('taller/:id')
  async actualizarPersonalTaller(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioTallerDto,
  ) {
    if (dto.rol && dto.rol !== 'ADMIN' && dto.rol !== 'MECANICO') {
      throw new BadRequestException('Rol inválido: solo ADMIN o MECANICO');
    }

    const actorId = req.user?.sub ?? req.user?.id;

    const rolEnum = dto.rol
      ? (AppRol[dto.rol as keyof typeof AppRol])
      : undefined;

    return this.usuarios.actualizarPersonalTaller(actorId, id, {
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      rol: rolEnum as AppRol.ADMIN | AppRol.MECANICO | undefined,
    });
  }

  // Desactivar personal del taller (soft delete)
  @UseGuards(JwtAuthGuard)
  @Delete('taller/:id')
  async desactivarPersonalTaller(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actorId = req.user?.sub ?? req.user?.id;
    const usuario = await this.usuarios.desactivarPersonalTaller(actorId, id);
    return { ok: true, usuario };
  }

  // Activar personal del taller
  @UseGuards(JwtAuthGuard)
  @Put('taller/:id/activar')
  async activarPersonalTaller(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actorId = req.user?.sub ?? req.user?.id;
    const usuario = await this.usuarios.activarPersonalTaller(actorId, id);
    return { ok: true, usuario };
  }

  // Cambiar contraseña de un usuario del taller
  @UseGuards(JwtAuthGuard)
  @Put('taller/:id/clave')
  async cambiarClaveTaller(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CambiarClaveTallerDto,
  ) {
    if (!body.nuevaClave || body.nuevaClave.trim().length < 6) {
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 6 caracteres',
      );
    }

    const actorId = req.user?.sub ?? req.user?.id;
    const usuario = await this.usuarios.cambiarClavePersonalTaller(
      actorId,
      id,
      body.nuevaClave.trim(),
    );
    return { ok: true, usuario };
  }
}
