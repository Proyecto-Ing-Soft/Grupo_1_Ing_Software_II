import * as jwt from 'jsonwebtoken';


// SRP: emitir/verificar JWT.
// OCP: fácil de extender con otros emisores/algoritmos.
export class JwtEstrategias {
  emitirAccess(descriptor: any) {
    return jwt.sign(descriptor, process.env.JWT_ACCESS_SECRET!, { expiresIn: process.env.JWT_ACCESS_TTL || '15m' });
    // DRY: expiración controlada por env.
  }
  emitirRefresh(descriptor: any) {
    return jwt.sign(descriptor, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_TTL || '7d' });
  }
  verificarRefresh(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }
}
