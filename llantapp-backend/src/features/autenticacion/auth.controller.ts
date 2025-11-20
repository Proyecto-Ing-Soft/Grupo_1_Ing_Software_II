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
import { LoginDto } from './dto/login.dto';

// SRP: coordina HTTP ↔ servicios de autenticación y usuarios.
@Controller('auth')
export class AuthController {
  private jwt = new JwtEstrategias();

  constructor(
    private readonly usuarios: UsuarioService,
    private readonly auth: AuthService,
  ) {}

  // Registro de usuario en un taller específico
  @Post('registrar')
  registrar(
    @Body()
    body: {
      slugTaller: string;
      datos: RegistrarUsuarioDto;
    },
  ) {
    const { slugTaller, datos } = body;
    if (!slugTaller) {
      throw new BadRequestException('slugTaller es requerido');
    }
    return this.auth.registrar(slugTaller, datos);
  }

  // Registro de cliente global (sin taller)
  @Post('registrar-cliente-global')
  async registrarClienteGlobal(
    @Body() datos: RegistrarUsuarioDto,
  ) {
    // Aquí NO se exige slugTaller: el cliente vive en app.usuario_cliente
    return this.auth.registrarClienteGlobal(datos);
  }

  // Login en un taller específico
  @Post('login')
  async login(
    @Body()
    body: {
      slugTaller: string;
      credenciales: LoginDto;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { slugTaller, credenciales } = body;
    if (!slugTaller) {
      throw new BadRequestException('slugTaller es requerido');
    }

    const tokens = await this.auth
      .login(slugTaller, credenciales)
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

  // Login de cliente global (sin taller)
  @Post('login-cliente-global')
  async loginClienteGlobal(
    @Body() credenciales: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth
      .loginClienteGlobal(credenciales)
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

    const { accessToken } = await this.auth.renovarAccess(rt);

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async perfil(@Req() req: any) {
    const user = req.user as JwtPayloadAcceso & { slugTaller?: string };

    const slugTaller = user.slugTaller;
    if (!slugTaller) {
      throw new UnauthorizedException('Taller no determinado');
    }

    const u = await this.usuarios.buscarPorId(slugTaller, Number(user.sub));
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
  async crearPersonalTaller(
    @Req() req: any,
    @Body()
    dto: RegistrarUsuarioDto & { slugTaller: string; clave: string },
  ) {
    if (!dto.rol) {
      throw new BadRequestException(
        'Debe especificar un rol válido configurado en la base de datos',
      );
    }

    if (!dto.slugTaller) {
      throw new BadRequestException('slugTaller es requerido');
    }

    return this.usuarios.crearPersonalTaller({
      slugTaller: dto.slugTaller,
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      clave: dto.clave,
      rolCodigo: dto.rol,
    });
  }
}
