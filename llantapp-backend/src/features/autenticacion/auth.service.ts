import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsuarioService } from '../usuarios/usuario.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { Encriptador } from './encriptador';
import { JwtEstrategias } from './estrategies/jwt';
import { JwtPayloadAcceso, RolCodigo } from './tipos';
import { PrismaService } from '../../core/prisma/prisma.service';

// KISS: concentra la lógica de autenticación en un solo servicio.
@Injectable()
export class AuthService {
  private encriptador = new Encriptador();
  private jwt = new JwtEstrategias();

  constructor(
    private readonly usuarios: UsuarioService,
    private readonly prisma: PrismaService,
  ) {}

  async registrar(slugTaller: string, dto: RegistrarUsuarioDto) {
    const existe = await this.usuarios.buscarPorCorreo(
      slugTaller,
      dto.correo,
    );
    if (existe) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hash = await this.encriptador.hashear(dto.clave);

    // El rol (si se envía) debe existir en BD; la validación se delega a UsuarioService/BD.
    const nuevo = await this.usuarios.crear(slugTaller, {
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      hashClave: hash,
      rol: dto.rol,
    });

    return this.usuarios.aPublico(nuevo);
  }

  async login(slugTaller: string, dto: LoginDto) {
    const u = await this.usuarios.buscarPorCorreo(slugTaller, dto.correo);
    if (!u) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await this.encriptador.comparar(dto.clave, u.hashClave);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const descriptor: JwtPayloadAcceso & { slugTaller: string } = {
      sub: u.id,
      correo: u.correo,
      rol: u.rol as RolCodigo,
      nombreCompleto: u.nombreCompleto,
      slugTaller,
    };

    const accessToken = this.jwt.emitirAccess(descriptor);
    const refreshToken = this.jwt.emitirRefresh(descriptor);

    return { accessToken, refreshToken };
  }

    // Registro de cliente global (sin taller / sin multi-tenant)
  async registrarClienteGlobal(dto: RegistrarUsuarioDto) {
    const email = dto.correo.trim().toLowerCase();

    const existe = await this.prisma.usuarioCliente.findUnique({
      where: { email },
    });

    if (existe) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hash = await this.encriptador.hashear(dto.clave);

    const nuevo = await this.prisma.usuarioCliente.create({
      data: {
        nombreCompleto: dto.nombreCompleto.trim(),
        email,
        passwordHash: hash,
      },
    });

    const payload: JwtPayloadAcceso = {
      sub: Number(nuevo.id),
      correo: nuevo.email,
      rol: 'CLIENTE' as RolCodigo,
      nombreCompleto: nuevo.nombreCompleto,
    };

    const accessToken = this.jwt.emitirAccess(payload);
    const refreshToken = this.jwt.emitirRefresh(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  // Login de cliente global (sin taller / sin multi-tenant)
  async loginClienteGlobal(dto: LoginDto) {
    const email = dto.correo.trim().toLowerCase();

    const u = await this.prisma.usuarioCliente.findUnique({
      where: { email },
    });

    if (!u) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await this.encriptador.comparar(dto.clave, u.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayloadAcceso = {
      sub: Number(u.id),
      correo: u.email,
      rol: 'CLIENTE' as RolCodigo,
      nombreCompleto: u.nombreCompleto,
    };

    const accessToken = this.jwt.emitirAccess(payload);
    const refreshToken = this.jwt.emitirRefresh(payload);

    // Actualizar último login (sin bloquear el flujo si falla)
    try {
      await this.prisma.usuarioCliente.update({
        where: { id: u.id },
        data: { ultimoLogin: new Date() },
      });
    } catch {
      // swallow
    }

    return { accessToken, refreshToken };
  }

  async renovarAccess(refreshToken: string) {
    try {
      const decoded = this.jwt.verificarRefresh(refreshToken);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new UnauthorizedException('Refresh inválido');
      }

      const payload = decoded as unknown as JwtPayloadAcceso & {
        slugTaller?: string;
      };

      if (
        !payload ||
        typeof payload !== 'object' ||
        typeof payload.sub === 'undefined' ||
        typeof payload.correo !== 'string' ||
        typeof payload.rol === 'undefined' ||
        typeof payload.nombreCompleto !== 'string'
      ) {
        throw new UnauthorizedException('Refresh inválido');
      }

      const basePayload: JwtPayloadAcceso = {
        sub: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
        nombreCompleto: payload.nombreCompleto,
      };

      const descriptor =
        typeof (payload as any).slugTaller === 'string'
          ? { ...basePayload, slugTaller: (payload as any).slugTaller }
          : basePayload;

      const accessToken = this.jwt.emitirAccess(descriptor);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh inválido');
    }
  }
}
