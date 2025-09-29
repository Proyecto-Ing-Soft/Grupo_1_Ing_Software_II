// SRP: endpoints de vehículos del cliente.
const BASE = import.meta.env.VITE_API_BASE_URL as string;

export interface VehiculoMin {
  id: number;
  placa: string;
  marca?: string;
  modelo?: string;
}

export interface CrearVehiculoDTO {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  vin?: string;
}

async function getJSON<T = any>(ruta: string, token?: string): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!r.ok) throw new Error((await r.text()) || 'Error');
  return r.json();
}

async function postJSON<T = any>(ruta: string, body: unknown, token?: string): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) throw new Error((await r.text()) || 'Error');
  return r.json();
}

export const apiVehiculos = {
  mios: (token?: string) => getJSON<VehiculoMin[]>('/vehiculos/mios', token),

  crear: (datos: CrearVehiculoDTO, token?: string) =>
    postJSON('/vehiculos', datos, token),
};
