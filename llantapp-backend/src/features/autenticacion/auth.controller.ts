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

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuarioService } from '../usuarios/usuario.service';

import { JwtEstrategias } from './estrategies/jwt';
import { JwtPayloadAcceso, RolCodigo } from './tipos';
import { AuthService } from './auth.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolRequerido } from '../../common/decorators/rol-requerido.decorator';

// SRP: coordina HTTP ↔ servicios de autenticación y usuarios.
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

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request & { cookies?: any; signedCookies?: any },
  ) {
    const rt = (req.cookies?.rt || req.signedCookies?.rt) as
      | string
      | undefined;

    if (!rt) {
      throw new UnauthorizedException('Sin refresh token');
    }

    const decoded = this.jwt.verificarRefresh(rt);

    if (typeof decoded !== 'object' || decoded === null) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const dec = decoded as {
      sub: number | string;
      iat: number;
      exp: number;
      rol?: RolCodigo;
      correo?: string;
      nombreCompleto?: string;
    };

    const userId =
      typeof dec.sub === 'string' ? Number(dec.sub) : dec.sub;

    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const u = await this.usuarios.buscarPorId(userId);
    if (!u) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload: JwtPayloadAcceso = {
      sub: u.id,
      rol: u.rol as RolCodigo,
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
    if (!u) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.usuarios.aPublico(u);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('rt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    });
    return { ok: true };
  }

  // Uso de roles declarados a nivel de endpoint, validados contra el JWT.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolRequerido('OWNER', 'ADMIN_TALLER')
  @Post('taller')
  async crearPersonalTaller(@Body() dto: RegistrarUsuarioDto) {
    if (!dto.rol) {
      throw new BadRequestException(
        'Debe especificar un rol válido configurado en la base de datos',
      );
    }

    return this.auth.registrar(dto);
  }
}
