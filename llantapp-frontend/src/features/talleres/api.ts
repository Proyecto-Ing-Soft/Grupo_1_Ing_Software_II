// llantapp-frontend/src/features/talleres/api.ts
// API para consumir la lista "lite" de talleres desde el frontend.

import { getJSON } from "../../core/http/_http";

export interface TallerLite {
  id: number;
  nombre: string;
}

export const apiTalleres = {
  /**
   * Obtiene la lista de talleres (id + nombre) desde el backend.
   * Endpoint: GET /talleres-lite
   */
  listarLite: () => getJSON<TallerLite[]>("/talleres-lite"),
};
