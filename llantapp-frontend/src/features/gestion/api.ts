// src/features/usuarios/api.ts
import { getJSON, postJSON, putJSON, delJSON, patchJSON } from '../../core/http/_http';

// Definimos un tipo local SOLO para taller:
export type TallerRol = 'ADMIN' | 'MECANICO';

export type UsuarioTaller = {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: TallerRol;      // ← sólo ADMIN | MECANICO
  creadoEn?: string;
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
  listarTaller: (token?: string) => getJSON<UsuarioTaller[]>(`/usuarios/taller`, token),
  // 🔁 CREATE ahora en AUTH
  crearTaller: (payload: CrearUsuarioTallerDto, token?: string) =>
    postJSON<UsuarioTaller>(`/auth/taller`, payload, token),
  actualizarTaller: (id: number, payload: ActualizarUsuarioTallerDto, token?: string) =>
    putJSON<UsuarioTaller>(`/usuarios/taller/${id}`, payload, token),
  eliminarTaller: (id: number, token?: string) =>
    delJSON<{ ok: true }>(`/usuarios/taller/${id}`, token),
  listarAdmins: (token?: string) => getJSON<UsuarioTaller[]>(`/usuarios?rol=ADMIN`, token),
  listarMecs:   (token?: string) => getJSON<UsuarioTaller[]>(`/usuarios?rol=MECANICO`, token),
};