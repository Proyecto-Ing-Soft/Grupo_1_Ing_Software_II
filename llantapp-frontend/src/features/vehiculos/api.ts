// === apiVehiculos.ts ===
// Front listo para Opción B (IDs estrictos).
// - crea/creaDesdeCita ahora esperan marcaVehiculoId y modeloVehiculoId.
// - Incluye apiCatalogos (marcas y modelos) para tus selects.
// - Mantiene manejo de token y errores (401 con mensaje claro).

import { tokenMemoria } from '../../core/utils/storageMemoria';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// Lo que devuelve el backend tras crear/listar:
export type VehiculoMin = { id: number; placa: string; marca: string; modelo: string };

// Catálogos (para selects)
export type Marca = { id: number; nombre: string };
export type Modelo = { id: number; nombre: string };

// Payloads estrictos por IDs (Opción B)
export type CrearVehiculoPayload = {
  placa: string;
  anio: number;
  color?: string;
  vin?: string;
  alias?: string;
  propietarioUsuarioId: number;
  marcaVehiculoId: number;
  modeloVehiculoId: number;
};

export type CrearVehiculoDesdeCitaPayload = {
  placa: string;
  anio: number;
  color?: string;
  vin?: string;
  alias?: string;
  // En "desde-cita" el propietario puede deducirse de la cita; lo dejamos opcional
  propietarioUsuarioId?: number;
  marcaVehiculoId: number;
  modeloVehiculoId: number;
};

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

// ===================
// Catálogos (para UI)
// ===================
export const apiCatalogos = {
  // Lista marcas para el <select>
  marcas: (token?: string) => getAuthed<Marca[]>('/catalogos/marcas', token),

  // Lista modelos filtrando por marca seleccionada
  modelos: (marcaId: number, token?: string) =>
    getAuthed<Modelo[]>(`/catalogos/marcas/${marcaId}/modelos`, token),
};

// ===================
// Vehículos (estricto)
// ===================
export const apiVehiculos = {
  // Lista de vehículos del propietario autenticado
  mios: (token?: string) => getAuthed<VehiculoMin[]>('/vehiculos/mios', token),

  // Crear vehículo (IDs estrictos)
  crear: (payload: CrearVehiculoPayload, token?: string) =>
    postAuthed<VehiculoMin>('/vehiculos', payload, token),

  // Crear vehículo desde una cita (IDs estrictos)
  crearDesdeCita: (citaId: number, payload: CrearVehiculoDesdeCitaPayload, token?: string) =>
    postAuthed<VehiculoMin>(`/vehiculos/desde-cita/${citaId}`, payload, token),
};

/*
USO RÁPIDO (ejemplo):
---------------------
const marcas = await apiCatalogos.marcas();
setMarcas(marcas);

const onMarcaChange = async (marcaId: number) => {
  const modelos = await apiCatalogos.modelos(marcaId);
  setModelos(modelos);
};

await apiVehiculos.crear({
  placa: 'ABC-123',
  anio: 2020,
  color: 'Negro',
  propietarioUsuarioId: 42,
  marcaVehiculoId: selectedMarcaId,
  modeloVehiculoId: selectedModeloId,
}, token);
*/
