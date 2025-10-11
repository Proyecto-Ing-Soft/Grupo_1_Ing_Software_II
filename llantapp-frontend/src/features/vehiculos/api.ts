import { tokenMemoria } from '../../core/utils/storageMemoria';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export type VehiculoMin = { id: number; placa: string; marca: string; modelo: string };

function readAuthToken(explicit?: string) {
  return (
    explicit ??
    tokenMemoria.get() ??
    localStorage.getItem('access_token') ??
    undefined
  );
}

async function getAuthed<T>(url: string, token?: string): Promise<T> {
  const auth = readAuthToken(token);
  const r = await fetch(`${API_BASE}${url}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    credentials: 'include',
  });
  if (!r.ok) {
    // Mejora de DX: mensaje claro cuando expira el token
    const text = await r.text().catch(() => r.statusText);
    if (r.status === 401) throw new Error('Token inválido o expirado');
    throw new Error(text || r.statusText);
  }
  return r.json() as Promise<T>;
}

async function postAuthed<T>(url: string, body?: any, token?: string): Promise<T> {
  const auth = readAuthToken(token);
  const r = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!r.ok) {
    const text = await r.text().catch(() => r.statusText);
    if (r.status === 401) throw new Error('Token inválido o expirado');
    throw new Error(text || r.statusText);
  }
  return r.json() as Promise<T>;
}

export const apiVehiculos = {
  // Lista los vehículos del dueño autenticado (usa Authorization o cookies HttpOnly)
  mios: (token?: string) => getAuthed<VehiculoMin[]>('/vehiculos/mios', token),

  // Crear vehículo (taller/admin)
  crear: (
    payload: {
      placa: string;
      marca: string;
      modelo: string;
      anio: number;
      color: string;
      vin?: string;
      propietarioUsuarioId: number;
    },
    token?: string
  ) => postAuthed<VehiculoMin>('/vehiculos', payload, token),

  // Crear vehículo desde una cita (taller/admin)
  crearDesdeCita: (
    citaId: number,
    payload: {
      placa: string;
      marca: string;
      modelo: string;
      anio: number;
      color: string;
      vin?: string;
      propietarioUsuarioId?: number;
    },
    token?: string
  ) => postAuthed<VehiculoMin>(`/vehiculos/desde-cita/${citaId}`, payload, token),
};
