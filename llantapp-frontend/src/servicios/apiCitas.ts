// SRP: endpoints de citas de mantenimiento.
const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type EstadoCita = 'SOLICITADA' | 'ACEPTADA' | 'EN_PROGRESO' | 'TERMINADA';
export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO' | 'LEGAL_ITV' | 'EXTRAS';

export interface CitaDTOCrear {
  tipo: TipoMantenimiento;
  vehiculoId: number;
  mecanicoId: number;
  programadaPara?: string; // ISO
  comentario: string;
}

export interface CitaItem {
  id: number;
  tipo: TipoMantenimiento;
  comentario: string;
  estado: EstadoCita;
  programadaPara?: string | null;
  vehiculo: { id: number; placa: string; marca?: string; modelo?: string };
  mecanico?: { id: number; nombreCompleto: string } | null;
  cliente?: { id: number; nombreCompleto: string } | null;
}

async function getJSON<T = any>(ruta: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJSON<T = any>(ruta: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const apiCitas = {
  crear: (body: CitaDTOCrear, token?: string) =>
    postJSON('/citas', body, token),

  mias: (token?: string) =>
    getJSON<CitaItem[]>('/citas/mias', token),

  asignadas: (token?: string) =>
    getJSON<CitaItem[]>('/citas/asignadas', token),

  aceptar: (id: number, token?: string) =>
    postJSON(`/citas/${id}/aceptar`, {}, token),

  iniciar: (id: number, token?: string) =>
    postJSON(`/citas/${id}/iniciar`, {}, token),

  terminar: (id: number, token?: string) =>
    postJSON(`/citas/${id}/terminar`, {}, token),
};
