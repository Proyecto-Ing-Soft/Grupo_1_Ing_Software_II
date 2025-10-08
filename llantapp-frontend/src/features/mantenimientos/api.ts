// PATRONES/PRINCIPIOS:
// - Facade: este mini-módulo “fachadea” las rutas HTTP para la UI.
// - DRY: centraliza rutas y parseo de tipos (vehiculoId a Number).
// - KISS: métodos autoexplicativos y de un solo propósito.

import { getJSON, postJSON } from '../../core/http/_http';

type Tipo = 'PREVENTIVO' | 'CORRECTIVO' | 'LEGAL_ITV' | 'EXTRAS';

export type TerminarCitaPayload = {
  trabajosRealizados: string;
  repuestos?: string[];
  evidenciaBase64?: string | null;
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

// PRINCIPIOS: Facade (rutas), DRY (tipos/payload unificados), KISS
export const apiCitas = {
  crear: (payload: {
    tipo: Tipo;
    placaPreliminar: string;
    marcaPreliminar: string;
    modeloPreliminar: string;
    anioPreliminar?: number;
    colorPreliminar?: string;
    vinPreliminar?: string;
    comentario?: string;
    programadaPara: string;
  }) => postJSON('/citas-mantenimiento', payload),

  pendientesAdmin: () => getJSON<any[]>('/citas-mantenimiento/admin/pendientes'),

  asignar: (id: number, mecanicoId: number) =>
    postJSON(`/citas-mantenimiento/${id}/asignar`, { mecanicoId }),

  registrarMantenimiento: (id: number, payload: TerminarCitaPayload) =>
    postJSON(`/citas-mantenimiento/${id}/terminar`, payload),

  terminar: (id: number) => postJSON(`/citas-mantenimiento/${id}/terminar`, {}),

  mias: () => getJSON<any[]>('/citas-mantenimiento/mias'),
  asignadas: () => getJSON<any[]>('/citas-mantenimiento/asignadas'),

  detalle: (id: number) => getJSON<CitaDetalle>(`/citas-mantenimiento/${id}`),
};