import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsuarioService } from '../../usuarios/usuario/usuario.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { Encriptador } from './encriptador';
import { Rol } from '../../../common/enums/rol.enum';
import { JwtEstrategias } from './estrategies/jwt';

// SRP: toda la lógica de autenticación en un servicio.
@Injectable()
export class AuthService {
  private encriptador = new Encriptador();   // KISS: simple inyección manual.
  private jwt = new JwtEstrategias();

  constructor(private usuarios: UsuarioService) {}

  async registrar(dto: RegistrarUsuarioDto) {
    const existe = await this.usuarios.buscarPorCorreo(dto.correo);
    if (existe) throw new ConflictException('El correo ya está registrado');

    const hash = await this.encriptador.hashear(dto.clave);
    const nuevo = await this.usuarios.crear({
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      hashClave: hash,
      rol: dto.rol ?? Rol.CHOFER,
    });
    return this.usuarios.aPublico(nuevo);
  }

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

  async renovarAccess(refreshToken: string) {
    try {
      const payload: any = this.jwt.verificarRefresh(refreshToken);
      const accessToken = this.jwt.emitirAccess({
        sub: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
      });
      // YAGNI: sin rotación persistente ni lista negra aún (se puede agregar en Sprint 2).
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh inválido');
    }
  }
}
