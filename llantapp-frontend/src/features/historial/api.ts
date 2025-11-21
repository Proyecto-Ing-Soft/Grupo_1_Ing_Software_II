// src/paginas/vehiculos/api.ts
import { getJSON } from '../../core/http/_http';

// Tipos que consume la página
export type VehiculoInfo = { id: number; placa: string; marca: string; modelo: string };

export interface TrabajoRealizado {
  id: number;
  tipo: string;
  fechaMantenimiento: string | null;
  trabajosRealizados: string | null;
  mecanico: { id?: number; nombreCompleto: string } | null;

  // ✅ Flag opcional para saber si hay evidencia
  evidenciaDisponible?: boolean;
}

export type ProximoServicio = {
  id: number;
  tipo: string;
  estado: string;                 // SOLICITADA | EN_PROGRESO | TERMINADA
  programadaPara: string | null;  // puede venir null
  comentario: string;
  mecanico: { nombreCompleto: string } | null;
};

export type HistorialData = {
  vehiculo: VehiculoInfo;
  trabajosRealizados: TrabajoRealizado[];
  proximosServicios: ProximoServicio[];
};

// Shapes que puede devolver el backend
type RawNuevo = {
  vehiculo: VehiculoInfo;
  trabajosRealizados: Array<{
    id: number;
    tipo: string;
    fechaMantenimiento: string | null;
    trabajosRealizados: string | null;
    mecanico: { id?: number; nombreCompleto: string } | null;
    evidenciaDisponible?: boolean; // ✅ puede venir del backend
  }>;
  proximosServicios: Array<{
    id: number;
    tipo: string;
    estado: string;
    programadaPara: string | null;
    comentario: string | null;
    mecanico: { nombreCompleto: string } | null;
  }>;
};

type RawViejo = {
  vehiculo: VehiculoInfo;
  items: Array<{
    id: number;
    tipo: string;
    estado: 'SOLICITADA' | 'EN_PROGRESO' | 'TERMINADA' | string;
    programadaPara?: string | null;
    fechaMantenimiento?: string | null;
    trabajosRealizados?: string | null;
    comentario?: string | null;
    mecanico?: { id?: number; nombreCompleto: string } | null;
    evidenciaDisponible?: boolean; // opcional si más adelante lo agregas
  }>;
};

// type guard
function esRawNuevo(x: any): x is RawNuevo {
  return x && Array.isArray(x.trabajosRealizados) && Array.isArray(x.proximosServicios);
}

export const apiHistorial = {
  porVehiculo: async (vehiculoId: number, token?: string): Promise<HistorialData> => {
    const raw = await getJSON<any>(`/historial/vehiculo/${vehiculoId}`, token);

    // Caso 1: el backend ya devuelve el shape nuevo
    if (esRawNuevo(raw)) {
      return {
        vehiculo: raw.vehiculo,
        trabajosRealizados: raw.trabajosRealizados.map((t) => ({
          id: t.id,
          tipo: t.tipo,
          fechaMantenimiento: t.fechaMantenimiento ?? null,
          trabajosRealizados: t.trabajosRealizados ?? null,
          mecanico: t.mecanico ?? { nombreCompleto: '—' },
          evidenciaDisponible: t.evidenciaDisponible ?? false, // ✅ mapeo
        })),
        proximosServicios: raw.proximosServicios.map((s) => ({
          id: s.id,
          tipo: s.tipo,
          estado: s.estado,
          programadaPara: s.programadaPara ?? null,
          comentario: s.comentario ?? '',
          mecanico: s.mecanico ?? null,
        })),
      };
    }

    // Caso 2: shape viejo { vehiculo, items }
    const old = raw as RawViejo;

    const proximosServicios: ProximoServicio[] = (old.items ?? [])
      .filter((i) => i.estado === 'SOLICITADA' || i.estado === 'EN_PROGRESO')
      .map((i) => ({
        id: i.id,
        tipo: i.tipo,
        estado: i.estado,
        programadaPara: i.programadaPara ?? null,
        comentario: i.comentario ?? '',
        mecanico: i.mecanico ?? null,
      }));

    const trabajosRealizados: TrabajoRealizado[] = (old.items ?? [])
      .filter((i) => i.estado === 'TERMINADA')
      .map((i) => ({
        id: i.id,
        tipo: i.tipo,
        fechaMantenimiento: i.fechaMantenimiento ?? i.programadaPara ?? null,
        trabajosRealizados: i.trabajosRealizados ?? null,
        mecanico: i.mecanico ?? { nombreCompleto: '—' },
        evidenciaDisponible: i.evidenciaDisponible ?? false, // ✅ aunque el backend viejo no lo mande, default false
      }));

    return {
      vehiculo: old.vehiculo,
      trabajosRealizados,
      proximosServicios,
    };
  },
};
