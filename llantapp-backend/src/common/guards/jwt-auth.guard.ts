// SRP: valida y decodifica el token, dejando req.user listo para los controladores.
// KISS: extracción simple de Bearer; mensajes claros.
// Demeter: el resto del código no necesita saber que el JWT usa "sub" → exponemos "id".

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

type JwtPayloadAcceso = {
  sub: number | string; // id del usuario
  rol: 'ADMIN' | 'MECANICO' | 'CLIENTE' | 'OWNER';
  nombreCompleto: string;
  correo: string;
  // agrega aquí audience/issuer si los usas
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] as string | undefined) ?? '';

    if (!auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta token');
    }

    const token = auth.slice('Bearer '.length).trim();
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      // Evita fallas silenciosas si falta el secreto en env
      throw new UnauthorizedException('Config de token no disponible');
    }

    try {
      const payload = jwt.verify(token, secret) as JwtPayloadAcceso;

      // Normaliza: expón .id (number) además de .sub para el resto de la app
      const idNum = typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
      if (!Number.isFinite(idNum)) throw new UnauthorizedException('Token inválido');

      req.user = {
        ...payload,
        id: idNum, // 👈 ahora puedes usar req.user.id en controllers/services
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
