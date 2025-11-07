// SRP: valida y decodifica el token, dejando req.user listo para los controladores.
// KISS: extracción simple de Bearer y verificación directa.

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayloadAcceso } from '../../features/autenticacion/tipos';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader =
      (req.headers['authorization'] as string | undefined) ?? '';

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta token');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Config de token no disponible');
    }

    try {
      const decoded = jwt.verify(token, secret);

      if (typeof decoded !== 'object' || decoded === null) {
        throw new UnauthorizedException('Token inválido');
      }

      const payload = decoded as unknown as JwtPayloadAcceso & {
        sub: number | string;
      };

      const idNum =
        typeof payload.sub === 'string'
          ? Number(payload.sub)
          : payload.sub;

      if (!Number.isFinite(idNum)) {
        throw new UnauthorizedException('Token inválido');
      }

      req.user = {
        ...payload,
        id: idNum,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
