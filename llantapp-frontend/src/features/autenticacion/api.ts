import { postJSON, getJSON } from '../../core/http/_http';

export type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';

export interface Perfil {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
}

export interface LoginResponse {
  accessToken: string; // el backend debe devolverlo
  perfil: Perfil;      // opcional, para retornarlo ya listo
}

export interface RefreshResponse {
  accessToken: string;
}

export const apiAuth = {
  registrar: (datos: { nombreCompleto: string; correo: string; clave: string }) =>
    postJSON('/auth/registrar', datos),

  login: (credenciales: { correo: string; clave: string }) =>
    postJSON<LoginResponse>('/auth/login', credenciales),

  // Usa Authorization: Bearer (lo mete _http.ts) + cookie httpOnly si el backend la usa
  perfil: (token?: string) => getJSON<Perfil>('/auth/perfil', token),

  refresh: () => postJSON<RefreshResponse>('/auth/refresh', {}),

  logout: () => postJSON<{ ok: true }>('/auth/logout', {}),
};
