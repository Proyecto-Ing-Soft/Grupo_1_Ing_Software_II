// PATRONES/PRINCIPIOS:
// - Facade: este mini-módulo “fachadea” las rutas HTTP para la UI.
// - DRY: centraliza rutas y parseo de tipos (IDs numéricos).
// - KISS: métodos autoexplicativos y de un solo propósito.

import { getJSON } from '../../core/http/_http';
import { tokenMemoria } from '../../core/utils/storageMemoria';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export type EvidenciaDescarga = { url: string; mime: string; blob: Blob };

export type TerminarCitaPayload = {
  trabajosRealizados?: string;
  repuestos?: string[];
  evidenciaBase64?: string | null;
};

export interface CitaDetalle {
  id: number;
  fechaProgramada: string;
  comentariosCliente?: string | null;
  vehiculo?: { id: number; placa: string | null } | null;
  servicio?: { id: number; nombre: string | null } | null;
  estado?: { codigo: string; nombre?: string | null } | null;
  [key: string]: any;
}

// Servicios disponibles (desde BD; aquí solo tipamos el contrato)
export type ServicioMin = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

function readAuthToken(explicit?: string) {
  return explicit ?? tokenMemoria.get() ?? localStorage.getItem('access_token') ?? undefined;
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
    const text = await r.text().catch(() => r.statusText);
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
    throw new Error(text || r.statusText);
  }
  return r.json() as Promise<T>;
}

// Payload de creación de cita
export type CitaCrearPayload = {
  vehiculoId: number;
  servicioId: number;
  comentario?: string;
  fechaProgramada: string; // ISO 8601
};

// PRINCIPIOS: Facade (rutas), DRY (tipos/payload unificados), KISS
export const apiCitas = {
  // POST /citas
  crear: (payload: CitaCrearPayload) =>
    postAuthed('/citas', {
      vehiculoId: Number(payload.vehiculoId),
      servicioId: Number(payload.servicioId),
      comentario: payload.comentario?.trim() || undefined,
      fechaProgramada: payload.fechaProgramada,
    }),

  // GET /citas/admin/pendientes
  pendientesAdmin: () => getAuthed<any[]>('/citas/admin/pendientes'),

  // POST /citas/:id/asignar
  asignar: (id: number, mecanicoId: number) =>
    postAuthed(`/citas/${id}/asignar`, { mecanicoId }),

  // POST /citas/:id/finalizar con detalle (trabajos, evidencia)
  registrarMantenimiento: (id: number, payload: TerminarCitaPayload) =>
    postAuthed(`/citas/${id}/finalizar`, payload),

  // POST /citas/:id/finalizar sin detalle (atajo desde tarjetas)
  terminar: (id: number) => postAuthed(`/citas/${id}/finalizar`, {}),

  // GET /citas/mias
  mias: () => getAuthed<any[]>('/citas/mias'),

  // GET /citas/asignadas
  asignadas: () => getAuthed<any[]>('/citas/asignadas'),

  // GET /citas/:id
  detalle: (id: number) => getAuthed<CitaDetalle>(`/citas/${id}`),

  // Catálogo de servicios para el cliente
  serviciosDisponibles: () => getAuthed<ServicioMin[]>('/servicios'),
};

// Descarga de evidencia asociada a una cita
export async function descargarEvidenciaCita(
  citaId: number,
  token?: string,
): Promise<EvidenciaDescarga> {
  const auth = readAuthToken(token);
  const r = await fetch(`${API_BASE}/citas/${citaId}/evidencia`, {
    method: 'GET',
    headers: {
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  const blob = await r.blob();
  const mime = r.headers.get('Content-Type') || 'application/octet-stream';
  const url = URL.createObjectURL(blob);
  return { url, mime, blob };
}

// Helper tipado al nuevo /citas/:id
export async function obtenerDetalleCita(
  citaId: number,
  token?: string,
): Promise<CitaDetalle> {
  return getJSON<CitaDetalle>(`/citas/${citaId}`, token);
}
