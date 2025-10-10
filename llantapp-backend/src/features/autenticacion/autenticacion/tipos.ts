export interface JwtPayloadAcceso {
  sub: number;
  rol: 'ADMIN' | 'MECANICO' | 'CLIENTE';
  nombreCompleto: string;
  correo: string;
  iat?: number;
  exp?: number;
}
