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

    const usuario = await this.usuarios.buscarPorId(uid);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.usuarios.aPublico(usuario);
  }

  // Lista usuarios por rol (rol.codigo en BD)
  @UseGuards(JwtAuthGuard)
  @Get()
  async porRol(@Query() q: UsuariosPorRolQueryDto) {
    if (!q.rol) return [];
    return this.usuarios.listarPorRol(q.rol);
  }

  // Personal del taller (ej. ADMIN_TALLER, MECANICO)
  @UseGuards(JwtAuthGuard)
  @Get('taller')
  async listarTaller() {
    return this.usuarios.listarTaller();
  }

  // Actualizar datos / rol de personal de taller
  @Put('taller/:id')
  async actualizarPersonalTaller(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioTallerDto,
  ) {
    return this.usuarios.actualizarPersonalTaller(id, dto);
  }

  // Eliminar personal de taller
  @Delete('taller/:id')
  async eliminarPersonalTaller(@Param('id', ParseIntPipe) id: number) {
    await this.usuarios.eliminarPersonalTaller(id);
    return { ok: true };
  }
}
