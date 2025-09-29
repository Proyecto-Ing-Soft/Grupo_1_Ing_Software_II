// SRP: Endpoints de autenticación (nada más).
const BASE = import.meta.env.VITE_API_BASE_URL as string;

type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';

export interface Perfil {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
}

async function postJSON<T = any>(ruta: string, cuerpo: unknown): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // cookies httpOnly (refresh)
    body: JSON.stringify(cuerpo ?? {}),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Error en la petición');
  return res.json() as Promise<T>;
}

async function getJSONAutorizado<T = any>(ruta: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error((await res.text()) || 'Error en la petición');
  return res.json() as Promise<T>;
}

export const apiAuth = {
  registrar: (datos: { nombreCompleto: string; correo: string; clave: string }) =>
    postJSON('/auth/registrar', datos),

  login: (datos: { correo: string; clave: string }) =>
    postJSON<{ accessToken: string }>('/auth/login', datos),

  refresh: () => postJSON<{ accessToken: string }>('/auth/refresh', {}),

  perfil: (accessToken: string) =>
    getJSONAutorizado<Perfil>('/auth/perfil', accessToken),

  logout: () => postJSON<{ ok: true }>('/auth/logout', {}),
};
