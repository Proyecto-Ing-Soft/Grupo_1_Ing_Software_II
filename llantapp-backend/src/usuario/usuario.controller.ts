import { Controller, Get, Req, UseGuards, NotFoundException, Query } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuarioController {
  constructor(private usuarios: UsuarioService) {}

  // ✅ Endpoint existente: devuelve el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('yo')
  async yo(@Req() req: any) {
    const usuario = await this.usuarios.buscarPorId(req.user.sub);

    // ✅ KISS + Seguridad del tipo: evitamos pasar null a aPublico.
    if (!usuario) {
      // YAGNI: no inventamos lógica extra; simplemente 404.
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.usuarios.aPublico(usuario); // ahora es 100% Usuario
  }

  // ✅ Nuevo endpoint: lista usuarios por rol para el agendamiento de citas
  //    GET /usuarios?rol=MECANICO  → [{ id, nombreCompleto }]
  @UseGuards(JwtAuthGuard)
  @Get()
  async porRol(@Query('rol') rol?: string) {
    // YAGNI: si no envían rol, devolvemos arreglo vacío sin complicarnos
    if (!rol) return [];
    return this.usuarios.listarPorRol(rol);
  }
}
