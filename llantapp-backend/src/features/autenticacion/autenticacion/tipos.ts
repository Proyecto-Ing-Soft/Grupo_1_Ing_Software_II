export interface JwtPayloadAcceso {
  sub: number;
  rol: 'ADMIN' | 'MECANICO' | 'CLIENTE' | 'OWNER';
  nombreCompleto: string;
  correo: string;
  iat?: number;
  exp?: number;
}
