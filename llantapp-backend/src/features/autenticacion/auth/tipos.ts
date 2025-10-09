export interface JwtPayloadAcceso {
  sub: number; // ID del usuario
  rol: 'ADMIN' | 'MECANICO' | 'CLIENTE';
  nombreCompleto: string;
  correo: string;
  iat?: number;
  exp?: number;
}
