// src/features/mantenimientos/api.ts
import { getJSON } from '../../core/http/_http';

export interface DetalleMantenimiento {
  id: number;
  vehiculo?: { placa?: string; marca?: string; modelo?: string } | null;
  trabajosRealizados?: string | null; // HTML o texto
  fechaFin?: string | null;           // ISO
}

function mapDetalle(raw: any): DetalleMantenimiento {
  return {
    id: raw.mantenimiento_id ?? raw.id,
    vehiculo: raw.vehiculo ?? null,
    trabajosRealizados: raw.resumen_tecnico_html ?? raw.trabajosRealizados ?? null,
    fechaFin: raw.fecha_fin ?? raw.fechaFin ?? null,
  };
}

export const apiMantenimientos = {
  obtenerDetalle: (mantId: number, token?: string): Promise<DetalleMantenimiento> =>
    getJSON<any>(`/mantenimientos/${mantId}`, token).then(mapDetalle),
};
