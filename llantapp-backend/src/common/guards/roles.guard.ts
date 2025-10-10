import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROL_REQUERIDO_KEY } from '../decorators/rol-requerido.decorator';
import { Rol } from '../enums/rol.enum';
import { JwtPayloadAcceso } from '../../features/autenticacion/autenticacion/tipos';

// SRP: verifica autorización por rol.
// DRY: usa metadata común.
// KISS: retorna si el rol del usuario está permitido.

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(ROL_REQUERIDO_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as JwtPayloadAcceso | undefined;

    if (!user) throw new ForbiddenException('No autenticado');

    // Asegura que el string del JWT coincide con tu enum Rol
    const rolUsuario = user.rol as Rol;

    if (!rolesRequeridos.includes(rolUsuario)) {
      throw new ForbiddenException('No tienes permisos para esta operación');
    }
    return true;
  }
}
