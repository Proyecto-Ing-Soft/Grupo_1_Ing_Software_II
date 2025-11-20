import { postJSON, getJSON, obtenerSlugTallerActual } from '../../core/http/_http';

// Los códigos de rol válidos provienen de la base de datos.
// Aquí solo tipamos como string (ej: "OWNER", "ADMIN_TALLER", "MECANICO", "CLIENTE").
export type Rol = string;

export interface Perfil {
  id: number;
  // Campos flexibles según backend
  nombreCompleto?: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  email?: string;
  rol: Rol;
  // Para roles de taller, el backend puede devolver el slug asociado
  // y así el front puede redirigir al menú correcto.
  tallerSlug?: string | null;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

/**
 * Slug opcional del taller:
 * - Si la URL o el entorno lo proveen, se manda al backend como slugTaller.
 * - Si no, se omite y el backend decide (modo global / detección por correo).
 */
function getSlugOpcional(): string | undefined {
  const slug = obtenerSlugTallerActual();
  return slug && slug.trim() ? slug.trim() : undefined;
}

export const apiAuth = {
  registrar: (datos: {
    nombreCompleto: string;
    correo: string;
    clave: string;
    rol?: Rol;
  }) => {
    const slug = getSlugOpcional();
    const body: any = { datos };

    if (slug) {
      body.slugTaller = slug;
    }

    return postJSON('/auth/registrar', body);
  },

  login: (credenciales: { correo: string; clave: string }) => {
    const slug = getSlugOpcional();
    const body: any = { credenciales };

    if (slug) {
      body.slugTaller = slug;
    }

    return postJSON<LoginResponse>('/auth/login', body);
  },

  perfil: (token?: string) => getJSON<Perfil>('/auth/perfil', token),

  refresh: () => postJSON<RefreshResponse>('/auth/refresh', {}),

  logout: () => postJSON<{ ok: true }>('/auth/logout', {}),
};
