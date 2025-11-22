// llantapp-frontend/src/features/autenticacion/api.ts
import { postJSON, getJSON } from "../../core/http/_http";

export type Rol = "ADMIN" | "MECANICO" | "CLIENTE" | "OWNER";

export interface Perfil {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
  // ⬇ relación con el taller (como viene desde /auth/perfil)
  taller?: {
    id: number;
    nombre: string;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  // por ahora el backend solo devuelve accessToken,
  // pero dejamos perfil opcional por si luego lo agregas
  perfil?: Perfil;
}

export interface RefreshResponse {
  accessToken: string;
}

// payload de registro (incluye tallerId opcional)
export interface RegistrarPayload {
  nombreCompleto: string;
  correo: string;
  clave: string;
  rol: Rol;
  tallerId?: number; // <-- aquí va el taller fijo (Motor Master, etc.)
}

export const apiAuth = {
  registrar: (datos: RegistrarPayload) =>
    postJSON("/auth/registrar", datos),

  login: (credenciales: { correo: string; clave: string }) =>
    postJSON<LoginResponse>("/auth/login", credenciales),

  // Usa Authorization: Bearer (lo mete _http.ts) + cookie httpOnly
  perfil: (token?: string) => getJSON<Perfil>("/auth/perfil", token),

  refresh: () => postJSON<RefreshResponse>("/auth/refresh", {}),

  logout: () => postJSON<{ ok: true }>("/auth/logout", {}),
};
