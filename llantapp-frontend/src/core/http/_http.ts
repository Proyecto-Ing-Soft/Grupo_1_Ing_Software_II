// DRY + KISS: fachada HTTP única. Adjunta Authorization y x-taller-slug automáticamente.

const BASE = import.meta.env.VITE_API_BASE_URL as string;
const TALLER_SLUG = import.meta.env.VITE_TALLER_SLUG as string | undefined;

import { tokenMemoria } from '../utils/storageMemoria';

type FetchOpts = { token?: string; body?: unknown };

function buildHeaders(token?: string) {
  const auth = token ?? tokenMemoria.get() ?? undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    headers.Authorization = `Bearer ${auth}`;
  }

  if (TALLER_SLUG) {
    headers['x-taller-slug'] = TALLER_SLUG;
  }

  return headers;
}

async function reqJSON<T>(ruta: string, method: string, opts: FetchOpts = {}): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`, {
    method,
    headers: buildHeaders(opts.token),
    credentials: 'include',
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });

  if (!r.ok) {
    let message = r.statusText;
    try {
      const raw = await r.text();
      try {
        const parsed = JSON.parse(raw);
        message = parsed?.message ?? raw ?? r.statusText;
      } catch {
        message = raw || r.statusText;
      }
    } catch {
      // ignore
    }
    const err: any = new Error(message);
    err.status = r.status;
    throw err;
  }

  if (r.status === 204) {
    return undefined as unknown as T;
  }

  return (await r.json()) as T;
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
