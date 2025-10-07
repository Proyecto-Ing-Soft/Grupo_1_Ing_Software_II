// src/servicios/apiCitas.ts

// PATRONES/PRINCIPIOS:
// - Facade: este mini-módulo “fachadea” las rutas HTTP para la UI.
// - DRY: centraliza rutas y parseo de tipos (vehiculoId a Number).
// - KISS: métodos autoexplicativos y de un solo propósito.
// src/servicios/apiCitas.ts
// src/servicios/apiCitas.ts
import { getJSON, postJSON } from './_http';
type Tipo = 'PREVENTIVO'|'CORRECTIVO'|'LEGAL_ITV'|'EXTRAS';

// PRINCIPIOS: Facade (rutas), DRY (tipos/payload unificados), KISS
export const apiCitas = {
  crear: (payload: {
    tipo: Tipo;
    placaPreliminar: string;
    marcaPreliminar: string;
    modeloPreliminar: string;
    anioPreliminar?: number;
    colorPreliminar?: string;
    vinPreliminar?: string;
    comentario?: string;
    programadaPara: string;
  }) => postJSON('/citas-mantenimiento', payload),

  pendientesAdmin: () => getJSON<any[]>('/citas-mantenimiento/admin/pendientes'),
  asignar: (id: number, mecanicoId: number) =>
    postJSON(`/citas-mantenimiento/${id}/asignar`, { mecanicoId }),

  terminar: (id: number) =>
    postJSON(`/citas-mantenimiento/${id}/terminar`, {}),

  mias: () => getJSON<any[]>('/citas-mantenimiento/mias'),
  asignadas: () => getJSON<any[]>('/citas-mantenimiento/asignadas'),
};
