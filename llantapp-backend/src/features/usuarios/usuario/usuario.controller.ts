import { Controller, Get, Req, UseGuards, NotFoundException, Query, Delete, ParseIntPipe, Param, Put, Body, BadRequestException } from '@nestjs/common';
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

    // KISS + Seguridad del tipo: evitamos pasar null a aPublico.
    if (!usuario) {
      // YAGNI: no inventamos lógica extra; simplemente 404.
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.usuarios.aPublico(usuario); // ahora es 100% Usuario
  }

  // Nuevo endpoint: lista usuarios por rol para el agendamiento de citas
  //    GET /usuarios?rol=MECANICO  → [{ id, nombreCompleto }]
  @UseGuards(JwtAuthGuard)
  @Get()
  async porRol(@Query() q: UsuariosPorRolQueryDto) {
    if (!q.rol) return [];
    return this.usuarios.listarPorRol(q.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Get('taller')
  async listarTaller() {
    return this.usuarios.listarTaller();
  }

  @Put('taller/:id')
  async actualizarPersonalTaller(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioTallerDto,
  ) {
    if (dto.rol && dto.rol !== 'ADMIN' && dto.rol !== 'MECANICO') {
      throw new BadRequestException('Rol inválido: solo ADMIN o MECANICO');
    }

    // Convertimos 'ADMIN' | 'MECANICO' (string) → AppRol enum
    const rolEnum = dto.rol ? (AppRol[dto.rol as keyof typeof AppRol]) : undefined;
    // rolEnum ahora está tipado como AppRol ('ADMIN' | 'MECANICO')

    return this.usuarios.actualizarPersonalTaller(id, {
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      rol: rolEnum as AppRol.ADMIN | AppRol.MECANICO, // narrow al literal del enum
    });
  }

  @Delete('taller/:id')
  async eliminarPersonalTaller(@Param('id', ParseIntPipe) id: number) {
    await this.usuarios.eliminarPersonalTaller(id);
    return { ok: true };
  }
}