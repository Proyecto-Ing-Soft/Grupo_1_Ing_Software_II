// DRY + KISS: fachada HTTP única. Adjunta Authorization y x-taller-slug automáticamente.

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const TALLER_SLUG = import.meta.env.VITE_TALLER_SLUG as string | undefined;

import { tokenMemoria } from '../utils/storageMemoria';

type FetchOpts = { token?: string; body?: unknown };

/**
 * Obtiene el slug del taller actual de forma dinámica:
 * - Primero intenta tomar el primer segmento de la URL (ej: /demo/login/cliente → "demo").
 * - Si ese segmento es una ruta "global" (login, registro, inicio, solicitudes),
 *   o no existe, cae de vuelta a VITE_TALLER_SLUG.
 */
export function obtenerSlugTallerActual(): string | undefined {
  try {
    if (typeof window !== 'undefined' && window.location) {
      const url = new URL(window.location.href);

      const slugQS =
        url.searchParams.get('slugTaller') ||
        url.searchParams.get('taller') ||
        url.searchParams.get('slug');

      if (slugQS && slugQS.trim()) {
        return slugQS.trim();
      }

      const pathname = url.pathname || '';
      const partes = pathname.split('/').filter(Boolean);

      if (partes.length > 0) {
        const candidato = partes[0];
        const reservados = ['login', 'registro', 'inicio', 'solicitudes'];

        if (!reservados.includes(candidato)) {
          return candidato;
        }
      }
    }
  } catch {
  }

  return TALLER_SLUG;
}

function buildHeaders(token?: string) {
  const auth = token ?? tokenMemoria.get() ?? undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    headers.Authorization = `Bearer ${auth}`;
  }

  const slug = obtenerSlugTallerActual();
  if (slug) {
    headers['x-taller-slug'] = slug;
    headers['x-slug-taller'] = slug;
  }

  return headers;
}

async function reqJSON<T>(
  ruta: string,
  method: string,
  opts: FetchOpts = {},
): Promise<T> {
  if (!BASE) {
    const err: any = new Error(
      'Config de API no disponible: falta VITE_API_BASE_URL en el frontend.',
    );
    err.offline = true;
    throw err;
  }

  let r: Response;
  try {
    r = await fetch(`${BASE}${ruta}`, {
      method,
      headers: buildHeaders(opts.token),
      credentials: 'include',
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });
  } catch (e: any) {
    const err: any = new Error(
      'No se pudo conectar con el servidor. Verifica que el backend esté encendido y que VITE_API_BASE_URL apunte al puerto correcto.',
    );
    err.cause = e;
    err.offline = true;
    throw err;
  }

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
