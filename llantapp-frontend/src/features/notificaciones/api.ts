// src/servicios/apiNotificacion.ts
import type { NotificacionDTO } from '../tipos/notificacion';
import { getJSON, postJSON } from './_http';

export const apiNotificacion = {
  mias: (token?: string) => getJSON<NotificacionDTO[]>('/notificaciones/mias', token),
  marcarLeida: (id: number, token?: string) =>
    postJSON<{ ok: true }>(`/notificaciones/${id}/marcar-leida`, {}, token),
};
