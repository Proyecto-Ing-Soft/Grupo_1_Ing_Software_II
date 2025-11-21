// PATRONES/PRINCIPIOS
// - Facade: módulo pequeño que esconde los endpoints HTTP.
// - KISS: métodos claros (crear, listarPorVehiculo).
// - DRY: tipos reutilizables para payload y respuesta.

import { getJSON, postJSON } from "../../core/http/_http";

export interface CrearIntervencionExternaPayload {
  vehiculoId: number;
  fecha: string;          // "YYYY-MM-DD"
  kilometraje?: number;
  descripcion: string;
  tallerNombre?: string;
  costoAproximado?: number;
}

export interface IntervencionExternaDTO {
  id: number;
  fecha: string;           // ISO
  kilometraje: number | null;
  descripcion: string;
  tallerNombre: string | null;
  costoAproximado: string | null; // viene como Decimal -> string
  creadoEn: string;        // ISO
}

export const apiIntervencionesExternas = {
  crear: (payload: CrearIntervencionExternaPayload) =>
    postJSON<IntervencionExternaDTO>("/intervenciones-externas", payload),

  listarPorVehiculo: (vehiculoId: number) =>
    getJSON<IntervencionExternaDTO[]>(`/intervenciones-externas/vehiculo/${vehiculoId}`),
};
