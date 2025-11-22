// src/features/asignaciones/api.ts
import { getJSON } from "../../core/http/_http";

// Estado de la cita (se mantiene igual)
export type EstadoCitaFE = "SOLICITADA" | "EN_PROGRESO" | "TERMINADA";

// Representación liviana del servicio (tipo de mantenimiento)
export type ServicioLite = {
  id: number;
  nombre: string;
};

export type CitaRow = {
  id: number;
  estado: EstadoCitaFE;
  programadaPara?: string | null;

  // Vehículo asociado (si está registrado)
  vehiculo?: { placa: string } | null;

  // Snapshot preliminar (si aún no hay vehículo registrado)
  placaPreliminar?: string | null;

  clienteId: number;
  mecanicoId?: number | null;

  // Mecánico asociado (si ya fue asignado)
  mecanico?: {
    id: number;
    nombreCompleto: string;
  } | null;

  // Servicio como "tipo de mantenimiento"
  servicioId?: number | null;
  servicio?: ServicioLite | null;
};

export type MecanicoRow = {
  id: number;
  nombreCompleto: string;
};

// === API USUARIOS (solo lo que pide el componente) ===
export const apiUsuarios = {
  // GET /usuarios?rol=MECANICO | ADMIN | CLIENTE
  listarPorRol: (
    rol: "ADMIN" | "MECANICO" | "CLIENTE",
    token?: string,
  ) => getJSON<MecanicoRow[]>(`/usuarios?rol=${rol}`, token),
};
