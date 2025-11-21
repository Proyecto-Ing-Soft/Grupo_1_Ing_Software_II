// PATRONES:
// - Facade: encapsula el endpoint de auditoría.
// - KISS: un método simple con filtros básicos.
// - DRY: centralizamos tipos y construcción de querystring.

import { getJSON } from '../../core/http/_http';

export interface AccionBitacora {
  id: number;
  tipo: string;
  descripcion: string;
  creadoEn: string; // ISO
  usuario: {
    id: number;
    nombreCompleto: string;
  };
  cita: {
    id: number;
    tipo: string;
    estado: string;
  } | null;
  mecanicoId?: number | null;
}

export const apiAuditoria = {
  listarAcciones: (params?: { citaId?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.citaId) qs.set('citaId', String(params.citaId));
    if (params?.limit) qs.set('limit', String(params.limit));

    const sufijo = qs.toString() ? `?${qs.toString()}` : '';
    return getJSON<AccionBitacora[]>(`/auditoria/acciones${sufijo}`);
  },
};
