import { SetMetadata } from '@nestjs/common';
import { Rol } from '../enums/rol.enum';

/**
 * SRP: adjunta metadata de roles requeridos al handler.
 * OCP: nuevos roles no rompen el decorador.
 */
export const ROL_REQUERIDO_KEY = 'rolesRequeridos';
export const RolRequerido = (...roles: Rol[]) => SetMetadata(ROL_REQUERIDO_KEY, roles);
