// Facade de API para promociones (US-04)
// KISS: solo lo necesario para que el admin envíe una promoción.
// Se apoya en los helpers HTTP genéricos del core.

import { postJSON,getJSON } from "../../core/http/_http";

export interface EnviarPromocionPayload {
  titulo: string;
  mensaje: string;
  usuarios?: number[];
}

export interface UsuarioItem {
  id: number;
  nombre: string;
}

export const apiUsuarios = {
  async listarClientes() {
    const raw = await getJSON<any[]>("/usuarios?rol=CLIENTE");

    return raw.map(u => ({
      id: u.id,
      nombre: u.nombre ?? u.nombres ?? u.nombreCompleto ?? "Cliente sin nombre"
    }));
  },
};

export const apiPromociones = {
  /**
   * Enviar una promoción a todos los clientes (solo ADMIN).
   * Llama a POST /notificaciones/admin/promociones
   */
  enviarPromocion(payload: EnviarPromocionPayload) {
    return postJSON("/notificaciones/admin/promociones", payload);
  },
};