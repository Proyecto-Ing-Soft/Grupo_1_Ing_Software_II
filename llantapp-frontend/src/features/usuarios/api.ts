// PATRONES Y PRINCIPIOS
// - Facade: simplifica el acceso a endpoints de usuarios (perfiles y personal de taller).
// - DRY: centraliza rutas y tipos compartidos.
// - KISS: funciones de propósito único, directamente mapeadas a la API.

import { getJSON, putJSON, delJSON } from '../../core/http/_http';
import type { Perfil, Rol } from '../autenticacion/api';

type UsuarioTallerApi = {
  id: number;
  nombreCompleto: string;
  correo?: string;
  email?: string;
  rol: Rol;
  [k: string]: unknown;
};

export const apiUsuarios = {
  // Lista usuarios por un código de rol (rol.codigo en BD).
  listarPorRol: (rol: Rol, token?: string) =>
    getJSON<Perfil[]>(`/usuarios?rol=${encodeURIComponent(rol)}`, token),

  // Personal del taller (ADMIN_TALLER, MECANICO) según la BD.
  listarTaller: (token?: string) =>
    getJSON<UsuarioTallerApi[]>('/usuarios/taller', token),

  // Actualizar datos / rol de personal de taller en la BD.
  actualizarPersonalTaller: (
    id: number,
    datos: { nombreCompleto?: string; correo?: string; rol?: Rol },
    token?: string,
  ) => putJSON<UsuarioTallerApi>(`/usuarios/taller/${id}`, datos, token),

  // Eliminar personal de taller en la BD.
  eliminarPersonalTaller: (id: number, token?: string) =>
    delJSON<{ ok: true }>(`/usuarios/taller/${id}`, token),
};
