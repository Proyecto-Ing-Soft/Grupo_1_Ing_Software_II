// src/features/autenticacion/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsuarioService } from '../../usuarios/usuario/usuario.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { Encriptador } from './encriptador';
import { Rol } from '../../../common/enums/rol.enum';
import { JwtEstrategias } from './estrategies/jwt';

@Injectable()
export class AuthService {
  // KISS: instancias simples (si prefieres, puedes inyectarlas vía providers)
  private encriptador = new Encriptador();
  private jwt = new JwtEstrategias();

  constructor(private usuarios: UsuarioService) {}

  // Registro de usuarios (CLIENTE por defecto)
  async registrar(dto: RegistrarUsuarioDto) {
    const existe = await this.usuarios.buscarPorCorreo(dto.correo);
    if (existe) throw new ConflictException('El correo ya está registrado');

    const hash = await this.encriptador.hashear(dto.clave);
    const nuevo = await this.usuarios.crear({
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      hashClave: hash,
      rol: dto.rol ?? Rol.CLIENTE,
    });
    return this.usuarios.aPublico(nuevo);
  }

  // Login: valida credenciales y emite tokens
  async login(dto: LoginDto) {
    const u = await this.usuarios.buscarPorCorreo(dto.correo);
    if (!u) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await this.encriptador.comparar(dto.clave, u.hashClave);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const descriptor = { sub: u.id, correo: u.correo, rol: u.rol };
    const accessToken = this.jwt.emitirAccess(descriptor);
    const refreshToken = this.jwt.emitirRefresh(descriptor);

    return { accessToken, refreshToken };
  }

  // Refresh de access token a partir del refresh token
  async renovarAccess(refreshToken: string) {
    try {
      const payload: any = this.jwt.verificarRefresh(refreshToken);
      const accessToken = this.jwt.emitirAccess({
        sub: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh inválido');
    }
  }
}
