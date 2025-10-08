// PRINCIPIOS:
// - Facade: encapsula las llamadas HTTP relacionadas a notificaciones.
// - DRY: centraliza rutas y tipos.
// - KISS: interfaz sencilla y autoexplicativa.

import type { NotificacionDTO } from './tipos';
import { getJSON, postJSON } from '../../core/http/_http';

export const apiNotificacion = {
  mias: (token?: string) =>
    getJSON<NotificacionDTO[]>('/notificaciones/mias', token),

  marcarLeida: (id: number, token?: string) =>
    postJSON<{ ok: true }>(`/notificaciones/${id}/marcar-leida`, {}, token),
};