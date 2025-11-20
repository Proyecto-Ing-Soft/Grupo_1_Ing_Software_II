import { postJSON, getJSON } from '../../core/http/_http';

export type Rol = 'OWNER' | 'ADMIN_TALLER' | 'MECANICO' | 'CLIENTE';

export interface Perfil {
  id: number;
  // Campos flexibles según backend
  nombreCompleto?: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  email?: string;
  rol: Rol;
  tallerSlug?: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export const apiAuth = {
  registrar: (datos: {
    nombreCompleto: string;
    correo: string;
    clave: string;
    rol: Rol;
  }) => postJSON('/auth/registrar', datos),

  login: (credenciales: { correo: string; clave: string }) =>
    postJSON<LoginResponse>('/auth/login', credenciales),

  perfil: (token?: string) => getJSON<Perfil>('/auth/perfil', token),

  refresh: () => postJSON<RefreshResponse>('/auth/refresh', {}),

  logout: () => postJSON<{ ok: true }>('/auth/logout', {}),
};
