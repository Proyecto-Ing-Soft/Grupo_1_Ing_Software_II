import * as jwt from 'jsonwebtoken';

// SRP: emitir y verificar JWT con secretos/TTL externos.
export class JwtEstrategias {
  emitirAccess(descriptor: any) {
    return jwt.sign(descriptor, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: process.env.JWT_ACCESS_TTL || '15m',
    });
  }

  emitirRefresh(descriptor: any) {
    return jwt.sign(descriptor, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_TTL || '7d',
    });
  }

  verificarRefresh(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
  }
}
