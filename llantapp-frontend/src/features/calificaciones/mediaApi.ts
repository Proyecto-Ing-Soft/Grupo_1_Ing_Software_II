import { getJSON } from '../../core/http/_http';

export type MediaItem = {
  id: string | number;
  tipo: 'IMG' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
};
export type ServicioMedia = {
  descripcion?: string | null;
  media: MediaItem[];
};

async function tryEndpoints<T>(endpoints: string[]): Promise<T> {
  let lastErr: any;
  for (const ep of endpoints) {
    try {
      return await getJSON<T>(ep);
    } catch (e: any) {
      lastErr = e;
      if (e?.status !== 404) break;
    }
  }
  throw lastErr;
}

function toServicioMedia(raw: any): ServicioMedia {
  if (raw?.evidencias && Array.isArray(raw.evidencias)) {
    return {
      descripcion:
        raw.descripcionTrabajos ??
        raw.descripcion_trabajos ??
        raw.trabajosRealizados ??
        raw.descripcion ??
        null,
      media: raw.evidencias
        .map((x: any, i: number) => ({
          id: x.id ?? i,
          tipo: String(
            x.tipo || x.tipoMedio || x.tipo_medio || ''
          )
            .toLowerCase()
            .includes('vid')
            ? 'VIDEO'
            : 'IMG',
          url:
            x.url ??
            x.url_externa ??
            x.link ??
            x.src,
          thumbnailUrl:
            x.thumbnailUrl ??
            x.thumb ??
            undefined,
        }))
        .filter((m: MediaItem) => !!m.url),
    };
  }

  if (Array.isArray(raw?.evidenciaUrls)) {
    return {
      descripcion:
        raw.descripcionTrabajos ??
        raw.descripcion_trabajos ??
        raw.trabajosRealizados ??
        raw.descripcion ??
        null,
      media: raw.evidenciaUrls.map(
        (u: string, i: number) => ({
          id: i,
          tipo: /(\.mp4|\.mov|\.webm)$/i.test(u)
            ? 'VIDEO'
            : 'IMG',
          url: u,
        })
      ),
    };
  }

  if (
    typeof raw?.evidenciaBase64 === 'string' &&
    raw.evidenciaBase64.startsWith('data:')
  ) {
    return {
      descripcion:
        raw.descripcionTrabajos ??
        raw.descripcion_trabajos ??
        raw.trabajosRealizados ??
        raw.descripcion ??
        null,
      media: [
        {
          id: 0,
          tipo: raw.evidenciaBase64.includes(
            'video'
          )
            ? 'VIDEO'
            : 'IMG',
          url: raw.evidenciaBase64,
        },
      ],
    };
  }

  return {
    descripcion:
      raw?.descripcionTrabajos ??
      raw?.descripcion_trabajos ??
      raw?.trabajosRealizados ??
      raw?.descripcion ??
      null,
    media: [],
  };
}

export const apiMedia = {
  porCita: async (
    citaId: number,
    token?: string
  ): Promise<ServicioMedia> => {
    const raw = await tryEndpoints<any>([
      `/citas/${citaId}/evidencias`,
      `/evidencias/cita/${citaId}`,
    ]);
    return toServicioMedia(raw);
  },

  porMantenimiento: async (
    mantenimientoId: number,
    token?: string
  ): Promise<ServicioMedia> => {
    const raw = await tryEndpoints<any>([
      `/mantenimientos/${mantenimientoId}`,
      `/evidencias/mantenimiento/${mantenimientoId}`,
    ]);
    return toServicioMedia(raw);
  },
};
