import type { NotificacionDTO } from '../tipos/notificacion';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

async function getJSON<T>(ruta: string, token?: string): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

async function postJSON<T>(ruta: string, body: unknown, token?: string): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export const apiNotificacion = {
  mias: (token?: string) => getJSON<NotificacionDTO[]>('/notificaciones/mias', token),
  marcarLeida: (id: number, token?: string) =>
    postJSON<{ ok: true }>(`/notificaciones/${id}/marcar-leida`, {}, token),
};
