// src/paginas/vehiculos/api.ts
import { getJSON, postJSON } from '../../core/http/_http';

export const apiVehiculos = {
  mios: (token?: string) => getJSON<any[]>('/vehiculos/mios', token),

  crear: (
    payload: {
      placa: string;
      marca: string;
      modelo: string;
      anio: number;
      color: string;
      vin?: string;
    },
    token?: string
  ) => postJSON('/vehiculos', payload, token),
};
