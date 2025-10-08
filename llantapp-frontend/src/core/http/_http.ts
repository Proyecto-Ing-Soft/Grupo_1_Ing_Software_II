// src/servicios/_http.ts
// DRY + KISS: fachada HTTP única. Adjunta Authorization automáticamente si existe.
const BASE = import.meta.env.VITE_API_BASE_URL as string;
import { tokenMemoria } from '../utils/storageMemoria';

// Centraliza cómo conseguimos el token (localStorage, memoria, etc.)
function getAccessToken(): string | undefined {
  // Si usas AuthContext, puedes hacer que lo copie a localStorage después del login
  return localStorage.getItem('access_token') ?? undefined;
}

type FetchOpts = { token?: string; body?: unknown };

async function reqJSON<T>(ruta: string, method: string, opts: FetchOpts = {}): Promise<T> {
  const token = opts.token ?? tokenMemoria.get() ?? undefined;
  const r = await fetch(`${BASE}${ruta}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include', // deja pasar cookie httpOnly para /auth/refresh si la usas
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  return r.json() as Promise<T>;
}

export function getJSON<T>(ruta: string, token?: string) {
  return reqJSON<T>(ruta, 'GET', { token });
}
export function postJSON<T>(ruta: string, body?: unknown, token?: string) {
  return reqJSON<T>(ruta, 'POST', { token, body });
}
export function putJSON<T>(ruta: string, body?: unknown, token?: string) {
  return reqJSON<T>(ruta, 'PUT', { token, body });
}
export function patchJSON<T>(ruta: string, body?: unknown, token?: string) {
  return reqJSON<T>(ruta, 'PATCH', { token, body });
}
export function delJSON<T>(ruta: string, token?: string) {
  return reqJSON<T>(ruta, 'DELETE', { token });
}
