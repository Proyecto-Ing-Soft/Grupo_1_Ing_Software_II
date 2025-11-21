// Facade simple para CRUD de consumibles desde la UI admin.

import { tokenMemoria } from '../../core/utils/storageMemoria';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export interface Consumible {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  descripcion: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

function readAuthToken(explicit?: string) {
  return explicit ?? tokenMemoria.get() ?? localStorage.getItem('access_token') ?? undefined;
}

async function requestJSON<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  token?: string,
): Promise<T> {
  const auth = readAuthToken(token);
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(method !== 'GET' && { 'Content-Type': 'application/json' }),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) return undefined as any;
  return res.json() as Promise<T>;
}

export const apiConsumibles = {
  listar: (token?: string) =>
    requestJSON<Consumible[]>('GET', '/consumibles', undefined, token),

  crear: (payload: {
    nombre: string;
    unidad: string;
    stockActual: number;
    stockMinimo: number;
    descripcion?: string;
    activo?: boolean;
  }) => requestJSON<Consumible>('POST', '/consumibles', payload),

  actualizar: (
    id: number,
    payload: Partial<{
      nombre: string;
      unidad: string;
      stockActual: number;
      stockMinimo: number;
      descripcion: string;
      activo: boolean;
    }>,
  ) => requestJSON<Consumible>('PUT', `/consumibles/${id}`, payload),

  eliminar: (id: number) =>
    requestJSON<{ ok: true }>('DELETE', `/consumibles/${id}`),
};
