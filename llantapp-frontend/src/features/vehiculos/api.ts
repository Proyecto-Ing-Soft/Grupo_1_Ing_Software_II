// src/paginas/vehiculos/api.ts
import { getJSON, postJSON } from '../../core/http/_http';

// 👇 Tipo que devuelve el backend al crear
export type VehiculoMin = { id: number; placa: string; marca: string; modelo: string };

export const apiVehiculos = {
  mios: (token?: string) => getJSON<any[]>('/vehiculos/mios', token),

  crear: (
    payload: {
      placa: string;
      marca: string;
      modelo: string;
      anio: number;
      color?: string;
      vin?: string;
      propietarioUsuarioId: number;
    },
    token?: string
  ) => postJSON<VehiculoMin>('/vehiculos', payload, token),

  crearDesdeCita: (
    citaId: number,
    payload: {
      placa: string;
      marca: string;
      modelo: string;
      anio: number;
      color?: string;
      vin?: string;
      propietarioUsuarioId?: number;
    },
    token?: string
  ) => postJSON<VehiculoMin>(`/vehiculos/desde-cita/${citaId}`, payload, token),
};
