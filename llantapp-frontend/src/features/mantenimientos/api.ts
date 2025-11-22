// llantapp-frontend/src/features/mantenimientos/api.ts
// PATRONES/PRINCIPIOS:
// - Facade: este mini-módulo “fachadea” las rutas HTTP para la UI.
// - DRY: centraliza rutas y parseo de tipos.
// - KISS: métodos autoexplicativos y de un solo propósito.

import { getJSON } from '../../core/http/_http';
import { tokenMemoria } from '../../core/utils/storageMemoria';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export type EvidenciaDescarga = { url: string; mime: string; blob: Blob };

export type TerminarCitaPayload = {
  trabajosRealizados: string;
  repuestos?: string[];
  evidenciaBase64?: string | null;

  // US-20: consumibles utilizados para descontar stock en backend
  consumos?: {
    consumibleId: number;
    cantidad: number;
  }[];
};

export interface CitaDetalle {
  id: number;
  clienteId?: number | null;

  // si ya existe vehiculo asociado
  vehiculo?: {
    placa?: string | null;
    marca?: string | null;
    modelo?: string | null;
    anio?: number | null;
    color?: string | null;
    vin?: string | null;
  } | null;

  // campos preliminares (como los usas en crear)
  placaPreliminar?: string | null;
  marcaPreliminar?: string | null;
  modeloPreliminar?: string | null;
  anioPreliminar?: number | null;
  colorPreliminar?: string | null;
  vinPreliminar?: string | null;

  programadaPara?: string | null;
}

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

// === US-07: Resumen técnico ===
export interface ResumenTecnico {
  citaId: number;
  // ahora viene como texto con el nombre del servicio
  tipo: string;
  estado: string;
  fechaMantenimiento: string | null;
  cliente: { id: number; nombreCompleto: string } | null;
  mecanico: { id: number; nombreCompleto: string } | null;
  servicio?: { id: number; nombre: string } | null;
  vehiculo: {
    placa: string | null;
    marca: string | null;
    modelo: string | null;
    anio: number | null;
  };
  trabajosRealizados: string;
  repuestos: string[];
  resumenTexto: string;
}

// PRINCIPIOS: Facade (rutas), DRY (tipos/payload unificados), KISS
export const apiCitas = {
  // Crear cita usando servicioId (catálogo de servicios)
  crear: (payload: {
    servicioId: number;
    vehiculoId?: number;
    placaPreliminar?: string;
    marcaPreliminar?: string;
    modeloPreliminar?: string;
    anioPreliminar?: number;
    colorPreliminar?: string;
    vinPreliminar?: string;
    comentario?: string;
    // El backend espera "YYYY-MM-DD"
    programadaPara: string;
  }) => postAuthed('/citas-mantenimiento', payload),

  // US-21: citas pendientes para ADMIN (solicitadas / en progreso)
  pendientesAdmin: () =>
    getAuthed<any[]>('/citas-mantenimiento/admin/pendientes'),

  // US-24: citas/mantenimientos vencidos (fecha pasada y no terminadas)
  vencidasAdmin: () =>
    getAuthed<any[]>('/citas-mantenimiento/admin/vencidas'),

  asignar: (id: number, mecanicoId: number) =>
    postAuthed(`/citas-mantenimiento/${id}/asignar`, { mecanicoId }),

  registrarMantenimiento: (id: number, payload: TerminarCitaPayload) =>
    postAuthed(`/citas-mantenimiento/${id}/terminar`, payload),

  terminar: (id: number) =>
    postAuthed(`/citas-mantenimiento/${id}/terminar`, {}),

  mias: () => getAuthed<any[]>('/citas-mantenimiento/mias'),
  asignadas: () => getAuthed<any[]>('/citas-mantenimiento/asignadas'),

  detalle: (id: number) =>
    getAuthed<CitaDetalle>(`/citas-mantenimiento/${id}`),

  // US-07: obtener resumen técnico de una cita terminada
  resumenTecnico: (id: number) =>
    getAuthed<ResumenTecnico>(`/citas-mantenimiento/${id}/resumen-tecnico`),
};

function getAuthToken(explicit?: string) {
  return (
    explicit ??
    tokenMemoria.get() ??
    localStorage.getItem('access_token') ??
    undefined
  );
}

export async function descargarEvidenciaCita(
  citaId: number,
  token?: string,
): Promise<EvidenciaDescarga> {
  const auth = getAuthToken(token);
  const r = await fetch(
    `${API_BASE}/citas-mantenimiento/${citaId}/evidencia`,
    {
      method: 'GET',
      headers: {
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      credentials: 'include',
    },
  );
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  const blob = await r.blob();
  const mime = r.headers.get('Content-Type') || 'application/octet-stream';
  const url = URL.createObjectURL(blob);
  return { url, mime, blob };
}

export async function obtenerDetalleCita(
  citaId: number,
  token?: string,
): Promise<{
  id: number;
  programadaPara: string | null;
  placaPreliminar: string | null;
  marcaPreliminar: string | null;
  modeloPreliminar: string | null;
  vehiculo: { placa: string | null } | null;
  trabajosRealizados?: string | null;
  evidenciaDisponible?: boolean;
}> {
  return getJSON(`/citas-mantenimiento/${citaId}`, token);
}
