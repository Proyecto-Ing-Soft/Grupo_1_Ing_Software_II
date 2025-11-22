// src/features/solicitudes-taller/api.ts
import { getJSON, postJSON } from "../../core/http/_http";

export type EstadoSolicitudTaller = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export interface CrearSolicitudTallerPayload {
  razonSocial: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  emailContacto: string;
  nombreContacto: string;
  adminNombre: string;
  adminEmail: string;
}

export interface SolicitudTallerDTO {
  id: number;
  razonSocial: string;
  ruc: string;
  direccion?: string | null;
  telefono?: string | null;
  emailContacto: string;
  nombreContacto: string;
  adminNombre: string;
  adminEmail: string;
  estado: EstadoSolicitudTaller;
  motivoRechazo: string | null;
  tallerId: number | null;
  creadoEn: string; // ISO
}

export interface AprobarSolicitudResponse {
  solicitud: SolicitudTallerDTO;
  taller: {
    id: number;
    nombre: string;
  };
  adminInicial: {
    id: number;
    nombreCompleto: string;
    email: string;
    passwordInicial: string; // solo se muestra una vez
  };
}

export const apiSolicitudesTaller = {
  crearPublica: (payload: CrearSolicitudTallerPayload) =>
    postJSON<SolicitudTallerDTO>("/solicitudes-taller", payload),

  pendientesOwner: () =>
    getJSON<SolicitudTallerDTO[]>("/solicitudes-taller/pendientes"),

  aprobar: (id: number) =>
    postJSON<AprobarSolicitudResponse>(`/solicitudes-taller/${id}/aprobar`, {}),

  rechazar: (id: number, motivoRechazo: string) =>
    postJSON<SolicitudTallerDTO>(`/solicitudes-taller/${id}/rechazar`, {
      motivoRechazo,
    }),
};
