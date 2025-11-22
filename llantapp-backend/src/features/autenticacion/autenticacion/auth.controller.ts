import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UsuarioService } from '../../usuarios/usuario/usuario.service';

import { JwtEstrategias } from './estrategies/jwt';
import { JwtPayloadAcceso } from './tipos';
import { AuthService } from './auth.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RolRequerido } from '../../../common/decorators/rol-requerido.decorator';
import { Rol } from '../../../common/enums/rol.enum';

@Controller('auth')
export class AuthController {
  private jwt = new JwtEstrategias();

  constructor(
    private readonly usuarios: UsuarioService,
    private readonly auth: AuthService,
  ) {}

  @Post('registrar')
  registrar(@Body() dto: RegistrarUsuarioDto) {
    return this.auth.registrar(dto);
  }

  @Post('login')
  async login(
    @Body() body: { correo: string; clave: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth
      .login({ correo: body.correo, clave: body.clave } as any)
      .catch(() => {
        throw new UnauthorizedException('Credenciales inválidas');
      });

    res.cookie('rt', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // El frontend luego llama /auth/perfil para obtener datos + empresa
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request & { cookies?: any; signedCookies?: any }) {
    const rt = (req.cookies?.rt || req.signedCookies?.rt) as string | undefined;
    if (!rt) throw new UnauthorizedException('Sin refresh token');

    const dec = this.jwt.verificarRefresh(rt) as unknown as {
      sub: number;
      iat: number;
      exp: number;
    };

    const u = await this.usuarios.buscarPorId(Number(dec.sub));
    if (!u) throw new UnauthorizedException('Usuario no encontrado');

    const payload: JwtPayloadAcceso = {
      sub: u.id,
      rol: u.rol as any,
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
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

    // aPublico quita hashClave, pero mantiene empresa si viene del findUnique
    return this.usuarios.aPublico(u as any);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('rt', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth',
    });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolRequerido(Rol.ADMIN)
  @Post('taller')
  async crearPersonalTaller(@Body() dto: RegistrarUsuarioDto) {
    const rol = dto.rol ?? Rol.MECANICO;
    if (rol !== Rol.ADMIN && rol !== Rol.MECANICO) {
      throw new BadRequestException('Rol inválido: debe ser ADMIN o MECANICO');
    }
    return this.auth.registrar({
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      clave: dto.clave,
      rol,
    });
  }
}
