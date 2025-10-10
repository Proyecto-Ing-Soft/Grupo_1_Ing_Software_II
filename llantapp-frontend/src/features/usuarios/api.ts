// PATRONES Y PRINCIPIOS
// - Facade: simplifica el acceso a endpoints de usuarios.
// - DRY: centraliza las rutas y los tipos compartidos.
// - KISS: sintaxis directa y de propósito único.

import { getJSON } from '../../core/http/_http';
import type { Perfil } from '../autenticacion/api';

export const apiUsuarios = {
  listarPorRol: (
    rol: 'ADMIN' | 'MECANICO' | 'CLIENTE',
    token?: string
  ) => getJSON<Perfil[]>(`/usuarios?rol=${rol}`, token),
};