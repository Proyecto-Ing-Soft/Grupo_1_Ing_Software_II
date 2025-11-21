// Facade de API para promociones (US-04)
// KISS: solo lo necesario para que el admin envíe una promoción.
// Se apoya en los helpers HTTP genéricos del core.

import { postJSON } from "../../core/http/_http";

export interface EnviarPromocionPayload {
  titulo: string;
  mensaje: string;
}

export const apiPromociones = {
  /**
   * Enviar una promoción a todos los clientes (solo ADMIN).
   * Llama a POST /notificaciones/admin/promociones
   */
  enviarPromocion(payload: EnviarPromocionPayload) {
    return postJSON("/notificaciones/admin/promociones", payload);
  },
};
