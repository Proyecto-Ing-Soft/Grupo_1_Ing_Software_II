// [Ruta del archivo: src/paginas/vehiculos/api.ts]
import { getJSON } from '../../core/http/_http';

// Principio: Definición de Contratos (Tipos)
// Estos tipos definen el "contrato" que el frontend espera
// de la API. Ahora están en snake_case para coincidir
// con la nueva estructura de la base de datos y la respuesta del servicio.

// Tipos que consume la página
export type VehiculoInfo = {
  vehiculo_id: number;
  placa: string;
  marca: string; // Este vendrá de la relación (ej. 'Toyota')
  modelo: string; // Este vendrá de la relación (ej. 'Yaris')
  anio: number;
  color: string | null;
};

export type TrabajoRealizado = {
  id: number; // ID del mantenimiento
  tipo: string; // Nombre del servicio
  fecha_fin: string | null;
  descripcion_trabajos: string | null;
  mecanico: string; // Nombre completo
};

export type ProximoServicio = {
  id: number; // ID de la cita
  tipo: string; // Nombre del servicio
  estado: string;
  fecha_programada: string | null;
  comentarios_cliente: string;
  mecanico: string | null; // Nombre completo
};

export type HistorialData = {
  vehiculo: VehiculoInfo;
  trabajosRealizados: TrabajoRealizado[];
  proximosServicios: ProximoServicio[];
};

// Shape que DEVUELVE el backend (Raw)
// Nota: La API de backend ya debería formatear los nombres de
// mecánico y servicio, por eso los tipos de arriba son simples.
type RawHistorialResponse = {
  vehiculo: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
    color: string | null;
  };
  trabajosRealizados: Array<{
    id: number;
    tipo: string;
    fechaMantenimiento: string | null; // El backend service lo mapea a 'fecha_fin'
    trabajosRealizados: string | null; // El backend service lo mapea a 'descripcion_trabajos'
    mecanico: string;
  }>;
  proximosServicios: Array<{
    id: number;
    tipo: string;
    estado: string;
    programadaPara: string | null; // El backend service lo mapea a 'fecha_programada'
    comentario: string; // El backend service lo mapea a 'comentarios_cliente'
    mecanico: string | null;
  }>;
};

export const apiHistorial = {
  porVehiculo: async (vehiculoId: number, token?: string): Promise<HistorialData> => {
    // ADVERTENCIA: La ruta de la API se cambió.
    // Antes: /historial/vehiculo/${vehiculoId}
    // Ahora: /vehiculos/${vehiculoId}/historial (según tu controller)
    const raw = await getJSON<RawHistorialResponse>(`/vehiculos/${vehiculoId}/historial`, token);

    // Principio: Anti-Corruption Layer (ACL)
    // Esta función actúa como una capa de "traducción".
    // Toma la respuesta "cruda" (Raw) de la API y la transforma
    // en el modelo de datos exacto que la UI necesita (HistorialData).
    // Se eliminó la lógica de 'esRawNuevo' porque ya no
    // necesitamos dar soporte a la API vieja.

    return {
      vehiculo: {
        vehiculo_id: raw.vehiculo.id,
        placa: raw.vehiculo.placa,
        marca: raw.vehiculo.marca,
        modelo: raw.vehiculo.modelo,
        anio: raw.vehiculo.anio,
        color: raw.vehiculo.color,
      },
      trabajosRealizados: raw.trabajosRealizados.map(t => ({
        id: t.id,
        tipo: t.tipo,
        fecha_fin: t.fechaMantenimiento ?? null,
        descripcion_trabajos: t.trabajosRealizados ?? null,
        mecanico: t.mecanico ?? '—',
    	})),
      proximosServicios: raw.proximosServicios.map(s => ({
        id: s.id,
        tipo: s.tipo,
        estado: s.estado,
        fecha_programada: s.programadaPara ?? null,
        comentarios_cliente: s.comentario ?? '',
        mecanico: s.mecanico ?? null,
      })),
    };
  },
};