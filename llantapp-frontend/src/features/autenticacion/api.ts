import { postJSON, getJSON } from '../../core/http/_http';

export type Rol = 'ADMIN' | 'MECANICO' | 'CLIENTE' | 'OWNER';

export interface Perfil {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
}

export interface LoginResponse {
  accessToken: string;
  perfil: Perfil;
}

export interface RefreshResponse {
  accessToken: string;
}

export const apiAuth = {
  registrar: (datos: { nombreCompleto: string; correo: string; clave: string; rol: Rol }) =>
    postJSON('/auth/registrar', datos),

  login: (credenciales: { correo: string; clave: string }) =>
    postJSON<LoginResponse>('/auth/login', credenciales),

  // Usa Authorization: Bearer (lo mete _http.ts) + cookie httpOnly
  perfil: (token?: string) => getJSON<Perfil>('/auth/perfil', token),

  refresh: () => postJSON<RefreshResponse>('/auth/refresh', {}),

  logout: () => postJSON<{ ok: true }>('/auth/logout', {}),
};
