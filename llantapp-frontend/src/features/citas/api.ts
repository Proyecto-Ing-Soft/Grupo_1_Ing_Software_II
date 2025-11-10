// PATRONES/PRINCIPIOS:
// - Facade: agrupa todas las rutas HTTP relacionadas a citas.
// - DRY: centraliza endpoints y manejo de autenticación.
// - KISS: interfaz simple y directa.

import { tokenMemoria } from "../../core/utils/storageMemoria";
import { apiCatalogoServicios } from "../catalogo-servicios/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// === Tipos ===
export type EvidenciaDescarga = { url: string; mime: string; blob: Blob };

export interface CrearCitaPayload {
  vehiculoId?: number;
  servicioId: number;
  comentario?: string;
  fechaProgramada: string;
  // Si el cliente no tiene vehículo aún
  placaPreliminar?: string;
  marcaPreliminar?: string;
  modeloPreliminar?: string;
  anioPreliminar?: number;
  colorPreliminar?: string;
  vinPreliminar?: string;
}

export interface CitaDetalle {
  id: number;
  fechaProgramada: string;
  vehiculo?: { placa: string | null } | null;
  servicio?: { nombre: string | null } | null;
  estado?: { codigo: string } | null;
  comentariosCliente?: string | null;
}

function readAuthToken(explicit?: string) {
  return (
    explicit ??
    tokenMemoria.get() ??
    localStorage.getItem("access_token") ??
    undefined
  );
}

async function getAuthed<T>(url: string, token?: string): Promise<T> {
  const auth = readAuthToken(token);
  const r = await fetch(`${API_BASE}${url}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  return r.json() as Promise<T>;
}

async function postAuthed<T>(
  url: string,
  body?: any,
  token?: string
): Promise<T> {
  const auth = readAuthToken(token);
  const r = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  return r.json() as Promise<T>;
}

// === API ===
export const apiCitas = {
  crear: (payload: CrearCitaPayload) => postAuthed("/citas", payload),
  mias: () => getAuthed<any[]>("/citas/mias"),
  asignadas: () => getAuthed<any[]>("/citas/asignadas"),
  pendientesAdmin: () => getAuthed<any[]>("/citas/admin/pendientes"),
  detalle: (id: number) => getAuthed<CitaDetalle>(`/citas/${id}`),
  evidencia: (id: number) => getAuthed<Blob>(`/citas/${id}/evidencia`),
};

// Utilidad para descarga de evidencia
export async function descargarEvidenciaCita(
  citaId: number,
  token?: string
): Promise<EvidenciaDescarga> {
  const auth = readAuthToken(token);
  const r = await fetch(`${API_BASE}/citas/${citaId}/evidencia`, {
    method: "GET",
    headers: {
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text().catch(() => r.statusText));
  const blob = await r.blob();
  const mime = r.headers.get("Content-Type") || "application/octet-stream";
  const url = URL.createObjectURL(blob);
  return { url, mime, blob };
}