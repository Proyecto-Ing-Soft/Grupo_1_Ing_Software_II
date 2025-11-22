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
  //    GET /usuarios?rol=MECANICO  → [{ id, nombreCompleto }]
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get()
  async porRol(@Req() req: any, @Query() q: UsuariosPorRolQueryDto) {
    if (!q.rol) return [];

    const uid = req.user?.sub ?? req.user?.id;
    return this.usuarios.listarPorRolEnTaller(q.rol, uid);
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

  // Eliminar personal del taller (solo ADMIN/MECÁNICO de MI taller)
  @UseGuards(JwtAuthGuard)
  @Delete('taller/:id')
  async eliminarPersonalTaller(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const actorId = req.user?.sub ?? req.user?.id;
    await this.usuarios.eliminarPersonalTaller(actorId, id);
    return { ok: true };
  }
}
