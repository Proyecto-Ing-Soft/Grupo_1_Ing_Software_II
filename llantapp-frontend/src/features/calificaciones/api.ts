import { getJSON, postJSON } from '../../core/http/_http';
import { Calificacion } from './type';

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
    return getJSON<{ items: any[]; total: number; page: number; pageSize: number }>(`/calificaciones/admin?${p.toString()}`);
  },
  stats: () =>
    getJSON<{
      promedioGlobal: number;
      totalCalificaciones: number;
      distribucion: { estrellas: number; total: number }[];
      promedioPorMecanico: { mecanicoId: number; nombre: string; promedio: number; n: number }[];
    }>(`/calificaciones/admin/stats`),
};

export const apiCalificaciones = {
  crear: (payload: { citaId: number; estrellas: number; comentario?: string }, token?: string) =>
    postJSON<{ ok: true; id: number }>('/calificaciones', payload, token),

  porCita: (citaId: number, token?: string) =>
    getJSON<Calificacion>(`/calificaciones/cita/${citaId}`, token),

  mias: (params: { page?: number; pageSize?: number }, token?: string) =>
    getJSON<{ items: any[]; total: number; page: number; pageSize: number }>(
      `/calificaciones/mias?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 10}`,
      token
    ),

  recibidas: (params: { page?: number; pageSize?: number }, token?: string) =>
    getJSON<{ items: Calificacion[]; total: number }>(
      `/calificaciones/recibidas?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`,
      token
    ),

  adminList: (q: {
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
    return getJSON<{ items: any[]; total: number; page: number; pageSize: number }>(
      `/calificaciones/admin?${p.toString()}`
    );
  },

  adminStats: () =>
    getJSON<{
      promedioGlobal: number;
      totalCalificaciones: number;
      distribucion: { estrellas: number; total: number }[];
      promedioPorMecanico: { mecanicoId: number; nombre: string; promedio: number; n: number }[];
    }>(`/calificaciones/admin/stats`),
};
