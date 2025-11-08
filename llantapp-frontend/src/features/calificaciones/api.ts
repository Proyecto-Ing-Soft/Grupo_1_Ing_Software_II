// src/features/calificaciones/api.ts
import { getJSON, postJSON } from '../../core/http/_http';
import { Calificacion } from './type';

// --- helpers de mapeo ---
type Raw = Record<string, any>;

function toCalificacion(raw: Raw): Calificacion {
  return {
    id: raw.calificacion_id ?? raw.id,
    mantenimientoId:
      raw.mantenimiento_id ??
      raw.mantenimientoId ??
      raw.mantId ??
      raw.mantenimiento, // tolerancia
    clienteUsuarioId:
      raw.cliente_usuario_id ??
      raw.clienteUsuarioId ??
      raw.clienteId ??
      raw.cliente, // tolerancia
    estrellas: raw.puntuacion ?? raw.estrellas,
    comentario: raw.comentario ?? null,
    creadaEn: raw.fecha_creacion ?? raw.creadaEn ?? raw.creada ?? new Date().toISOString(),
    visible: raw.visible ?? true,
  };
}

function toLista(raw: Raw): { items: Calificacion[]; total: number; page: number; pageSize: number } {
  const items = Array.isArray(raw.items) ? raw.items.map(toCalificacion) : [];
  return {
    items,
    total: Number(raw.total ?? items.length),
    page: Number(raw.page ?? 1),
    pageSize: Number(raw.pageSize ?? items.length ?? 10),
  };
}

// --- API pública para cliente/mecánico ---
export const apiCalificaciones = {
  // Obtener calificación por mantenimiento
  porMantenimiento: (mantId: number, token?: string): Promise<Calificacion> =>
    getJSON<Raw>(`/calificaciones/por-mantenimiento/${mantId}`, token).then(toCalificacion),

  // Crear calificación (única por mantenimiento y cliente)
  crear: (
    input: { mantenimientoId: number; estrellas: number; comentario?: string },
    token?: string
  ): Promise<Calificacion> =>
    postJSON<Raw>(`/calificaciones`, {
      // backend espera nombres del esquema nuevo
      mantenimientoId: input.mantenimientoId,
      puntuacion: input.estrellas,
      comentario: input.comentario ?? null,
    }, token).then(toCalificacion),

  // Mis calificaciones (cliente)
  mias: (q: { page?: number; pageSize?: number; desde?: string; hasta?: string }, token?: string) => {
    const p = new URLSearchParams();
    if (q.page) p.set('page', String(q.page));
    if (q.pageSize) p.set('pageSize', String(q.pageSize));
    if (q.desde) p.set('desde', q.desde);
    if (q.hasta) p.set('hasta', q.hasta);
    return getJSON<Raw>(`/calificaciones/mias?${p.toString()}`, token).then(toLista);
  },

  // Calificaciones recibidas (mecánico)
  recibidas: (
    q: { page?: number; pageSize?: number; mecanicoId?: number; estrellas?: number; desde?: string; hasta?: string },
    token?: string
  ) => {
    const p = new URLSearchParams();
    if (q.page) p.set('page', String(q.page));
    if (q.pageSize) p.set('pageSize', String(q.pageSize));
    if (q.mecanicoId) p.set('mecanicoId', String(q.mecanicoId));
    if (q.estrellas) p.set('estrellas', String(q.estrellas));
    if (q.desde) p.set('desde', q.desde);
    if (q.hasta) p.set('hasta', q.hasta);
    return getJSON<Raw>(`/calificaciones/recibidas?${p.toString()}`, token).then(toLista);
  },
};

// --- API admin (se mantiene) ---
export const apiAdminCalificaciones = {
  list: (q: {
    page?: number; pageSize?: number;
    mecanicoId?: number; estrellas?: number;
    desde?: string; hasta?: string; placa?: string;
  }) => {
    const p = new URLSearchParams();
    if (q.page) p.set('page', String(q.page));
    if (q.pageSize) p.set('pageSize', String(q.pageSize));
    if (q.mecanicoId) p.set('mecanicoId', String(q.mecanicoId));
    if (q.estrellas) p.set('estrellas', String(q.estrellas));
    if (q.desde) p.set('desde', q.desde);
    if (q.hasta) p.set('hasta', q.hasta);
    if (q.placa) p.set('placa', q.placa);
    return getJSON<Raw>(`/calificaciones/admin?${p.toString()}`).then(toLista);
  },

  adminStats: () =>
    getJSON<{
      promedioGlobal: number;
      totalCalificaciones: number;
      distribucion: { estrellas: number; total: number }[];
      promedioPorMecanico: { mecanicoId: number; nombre: string; promedio: number; n: number }[];
    }>(`/calificaciones/admin/stats`),
};
