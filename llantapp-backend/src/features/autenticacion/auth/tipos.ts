export interface JwtPayloadAcceso {
  sub: number; // ID del usuario
  rol: 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';
  nombreCompleto: string;
  correo: string;
  iat?: number;
  exp?: number;
}
