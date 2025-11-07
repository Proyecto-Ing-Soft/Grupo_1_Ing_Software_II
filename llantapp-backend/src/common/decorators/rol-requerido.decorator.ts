import { SetMetadata } from '@nestjs/common';

// SRP: centraliza la metadata de roles requeridos para los endpoints protegidos.
export const ROL_REQUERIDO_KEY = 'rolRequerido';

export const RolRequerido = (...roles: string[]) =>
  SetMetadata(ROL_REQUERIDO_KEY, roles);
