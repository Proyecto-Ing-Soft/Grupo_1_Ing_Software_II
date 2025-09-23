// src/auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayloadAcceso } from '../../auth/tipos';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const cabecera = req.headers['authorization'] as string | undefined;
    if (!cabecera?.startsWith('Bearer ')) throw new UnauthorizedException('Falta token');

    const token = cabecera.substring('Bearer '.length);
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as unknown as JwtPayloadAcceso;
      req.user = payload; // queda tipado (sub, rol, nombreCompleto, correo)
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
