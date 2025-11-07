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

// KISS: concentra la lógica de autenticación en un solo servicio.
@Injectable()
export class AuthService {
  private encriptador = new Encriptador();
  private jwt = new JwtEstrategias();

  constructor(private readonly usuarios: UsuarioService) {}

  async registrar(dto: RegistrarUsuarioDto) {
    const existe = await this.usuarios.buscarPorCorreo(dto.correo);
    if (existe) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hash = await this.encriptador.hashear(dto.clave);

    // El rol (si se envía) debe existir en BD; la validación se delega a UsuarioService/BD.
    const nuevo = await this.usuarios.crear({
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      hashClave: hash,
      rol: dto.rol,
    });

    return this.usuarios.aPublico(nuevo);
  }

  async login(dto: LoginDto) {
    const u = await this.usuarios.buscarPorCorreo(dto.correo);
    if (!u) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await this.encriptador.comparar(dto.clave, u.hashClave);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const descriptor: JwtPayloadAcceso = {
      sub: u.id,
      correo: u.correo,
      rol: u.rol as RolCodigo,
      nombreCompleto: u.nombreCompleto,
    };

    const accessToken = this.jwt.emitirAccess(descriptor);
    const refreshToken = this.jwt.emitirRefresh(descriptor);

    return { accessToken, refreshToken };
  }

  async renovarAccess(refreshToken: string) {
    try {
      const decoded = this.jwt.verificarRefresh(refreshToken);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new UnauthorizedException('Refresh inválido');
      }

      const payload = (decoded as unknown) as JwtPayloadAcceso;
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

      const accessToken = this.jwt.emitirAccess({
        sub: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
        nombreCompleto: payload.nombreCompleto,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh inválido');
    }
  }
}
