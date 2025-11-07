import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROL_REQUERIDO_KEY } from '../decorators/rol-requerido.decorator';
import { JwtPayloadAcceso } from '../../features/autenticacion/tipos';

// SRP: verifica autorización según metadata declarada en el endpoint.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const rolesRequeridos =
      this.reflector.getAllAndOverride<string[]>(ROL_REQUERIDO_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as JwtPayloadAcceso | undefined;

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    const rolUsuario = user.rol;

    if (!rolesRequeridos.includes(rolUsuario)) {
      throw new ForbiddenException(
        'No tienes permisos para esta operación',
      );
    }

    return true;
  }
}
