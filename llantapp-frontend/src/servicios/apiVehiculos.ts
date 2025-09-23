// servicios/apiVehiculos.ts
/**
 * SRP: encapsula llamadas HTTP de vehículos.
 * DRY: un único punto para headers, baseURL, manejo de errores.
 * KISS: solo lo necesario para registrar vehículo.
 */
export interface CrearVehiculoDTO {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  vin?: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const apiVehiculos = {
  async crear(datos: CrearVehiculoDTO, token: string) {
    const r = await fetch(`${BASE_URL}/vehiculos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // JWT
      },
      body: JSON.stringify(datos),
    });
    if (!r.ok) {
      const texto = await r.text().catch(() => '');
      throw new Error(texto || `Error ${r.status} al crear vehículo`);
    }
    return r.json();
  },
};
