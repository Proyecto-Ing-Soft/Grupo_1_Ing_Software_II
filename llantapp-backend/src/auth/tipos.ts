// src/auth/tipos.ts
export interface JwtPayloadAcceso {
  sub: number; // ID del usuario
  rol: 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CONDUCTOR';
  nombreCompleto: string;
  correo: string;
  iat?: number;
  exp?: number;
}
