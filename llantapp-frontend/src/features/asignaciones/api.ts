// src/features/asignaciones/api.ts
import { getJSON, postJSON } from "../../core/http/_http";

// Tipos compatibles con tu componente
export type TipoMantenimientoFE = "PREVENTIVO" | "CORRECTIVO" | "LEGAL_ITV" | "EXTRAS";
export type EstadoCitaFE = "SOLICITADA" | "EN_PROGRESO" | "TERMINADA";

export type CitaRow = {
  id: number;
  tipo: TipoMantenimientoFE;
  estado: EstadoCitaFE;
  programadaPara?: string | null;
  vehiculo?: { placa: string } | null;
  clienteId: number;
  mecanicoId?: number | null;
};

export type MecanicoRow = {
  id: number;
  nombreCompleto: string;
};

// === API USUARIOS (solo lo que pide el componente) ===
export const apiUsuarios = {
  // GET /usuarios?rol=MECANICO | ADMIN | CLIENTE
  listarPorRol: (rol: "ADMIN" | "MECANICO" | "CLIENTE") =>
    getJSON<MecanicoRow[]>(`/usuarios?rol=${rol}`),
};

