// Los códigos de rol válidos provienen de la base de datos.
export type RolCodigo = string;

// Payload estándar del access token.
export interface JwtPayloadAcceso {
  sub: number;
  rol: RolCodigo;
  nombreCompleto: string;
  correo: string;
  iat?: number;
  exp?: number;
}
