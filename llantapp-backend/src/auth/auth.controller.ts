// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtEstrategias } from './estrategies/jwt';
import { JwtPayloadAcceso } from './tipos';
import { AuthService } from './auth.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';

@Controller('auth')
export class AuthController {
  private jwt = new JwtEstrategias();

  constructor(private readonly usuarios: UsuarioService, private readonly auth: AuthService, ) {}

  @Post('registrar')
    registrar(@Body() dto: RegistrarUsuarioDto) {
      return this.auth.registrar(dto);
  }

  @Post('login')
  async login(
    @Body() body: { correo: string; clave: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const u = await this.usuarios.buscarPorCorreo(body.correo);
    if (!u) throw new UnauthorizedException('Credenciales inválidas');
    // TODO: reemplaza por verificación real de hash (bcrypt.compare)
    const ok = body.clave && u.hashClave; // simple placeholder
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    // payload para access y refresh
    const payload: JwtPayloadAcceso = {
      sub: u.id, rol: u.rol as any, nombreCompleto: u.nombreCompleto, correo: u.correo,
    };
    const accessToken = this.jwt.emitirAccess(payload);
    const refreshToken = this.jwt.emitirRefresh({ sub: u.id });

    // cookie httpOnly con refresh
    res.cookie('rt', refreshToken, {
      httpOnly: true,
      secure: false,          // pon true en prod con HTTPS
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const rt = (req.cookies?.rt || req.signedCookies?.rt) as string | undefined;
    if (!rt) throw new UnauthorizedException('Sin refresh token');
    const dec = this.jwt.verificarRefresh(rt) as unknown as { sub: number; iat: number; exp: number };
    const u = await this.usuarios.buscarPorId(Number(dec.sub));
    if (!u) throw new UnauthorizedException('Usuario no encontrado');

    const payload: JwtPayloadAcceso = {
      sub: u.id, rol: u.rol as any, nombreCompleto: u.nombreCompleto, correo: u.correo,
    };
    const accessToken = this.jwt.emitirAccess(payload);
    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async perfil(@Req() req: any) {
    const user = req.user as JwtPayloadAcceso;
    const u = await this.usuarios.buscarPorId(Number(user.sub));
    if (!u) throw new UnauthorizedException('Usuario no encontrado');
    return this.usuarios.aPublico(u);
  }
}
