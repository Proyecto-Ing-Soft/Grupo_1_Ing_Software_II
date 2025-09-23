import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuarioController {
  constructor(private usuarios: UsuarioService) {}

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
}
