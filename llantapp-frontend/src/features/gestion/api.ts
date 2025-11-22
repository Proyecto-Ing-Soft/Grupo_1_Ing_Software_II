// src/features/gestion/api.ts
import { getJSON, postJSON, putJSON, delJSON } from '../../core/http/_http';

// Definimos un tipo local SOLO para taller:
export type TallerRol = 'ADMIN' | 'MECANICO';

export type UsuarioTaller = {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: TallerRol;
  creadoEn?: string;
  taller?: {
    id: number;
    nombre: string;
  } | null;
};

export type CrearUsuarioTallerDto = {
  nombreCompleto: string;
  correo: string;
  clave: string;
  rol: TallerRol;      // ← sólo ADMIN | MECANICO
};

export type ActualizarUsuarioTallerDto = {
  nombreCompleto?: string;
  correo?: string;
  rol?: TallerRol;     // ← sólo ADMIN | MECANICO
};

export const apiUsuarios = {
  // Lista solo usuarios (ADMIN + MECÁNICO) del taller del admin logueado
  listarTaller: (token?: string) =>
    getJSON<UsuarioTaller[]>(`/usuarios/taller`, token),

  // CREATE: endpoint de creación de personal de taller (admin crea mecánico/admin)
  crearTaller: (payload: CrearUsuarioTallerDto, token?: string) =>
    postJSON<UsuarioTaller>(`/auth/taller`, payload, token),

  actualizarTaller: (id: number, payload: ActualizarUsuarioTallerDto, token?: string) =>
    putJSON<UsuarioTaller>(`/usuarios/taller/${id}`, payload, token),

  eliminarTaller: (id: number, token?: string) =>
    delJSON<{ ok: true }>(`/usuarios/taller/${id}`, token),

  // Fallbacks (por rol) – ahora backend ya filtra por taller del admin
  listarAdmins: (token?: string) =>
    getJSON<UsuarioTaller[]>(`/usuarios?rol=ADMIN`, token),

  listarMecs: (token?: string) =>
    getJSON<UsuarioTaller[]>(`/usuarios?rol=MECANICO`, token),
};
