import { getJSON } from '../../core/http/_http';

export type MediaItem = { id: string | number; tipo: 'IMG' | 'VIDEO'; url: string; thumbnailUrl?: string };
export type ServicioMedia = { descripcion?: string | null; media: MediaItem[] };

async function tryEndpoints<T>(endpoints: string[]): Promise<T> {
  let lastErr: any;
  for (const ep of endpoints) {
    try { return await getJSON<T>(ep); }
    catch (e: any) { lastErr = e; if (e?.status !== 404) break; }
  }
  throw lastErr;
}

function toServicioMedia(raw: any): ServicioMedia {
  // Normaliza distintos "shapes"
  // Caso A: { trabajosRealizados, evidencias:[{url, tipo}] }
  if (raw?.evidencias && Array.isArray(raw.evidencias)) {
    return {
      descripcion: raw.trabajosRealizados ?? raw.descripcion ?? null,
      media: raw.evidencias.map((x: any, i: number) => ({
        id: x.id ?? i,
        tipo: (String(x.tipo || '').toUpperCase().includes('VID') ? 'VIDEO' : 'IMG') as 'IMG' | 'VIDEO',
        url: x.url ?? x.link ?? x.src,
        thumbnailUrl: x.thumbnailUrl ?? x.thumb ?? undefined
      })).filter((m: MediaItem) => !!m.url),
    };
  }

  // Caso B: { evidenciaUrls:[], trabajosRealizados }
  if (Array.isArray(raw?.evidenciaUrls)) {
    return {
      descripcion: raw.trabajosRealizados ?? raw.descripcion ?? null,
      media: raw.evidenciaUrls.map((u: string, i: number) => ({
        id: i, tipo: /(\.mp4|\.mov|\.webm)$/i.test(u) ? 'VIDEO' : 'IMG', url: u
      })),
    };
  }

  // Caso C: { evidenciaBase64: "data:image/..." }
  if (typeof raw?.evidenciaBase64 === 'string' && raw.evidenciaBase64.startsWith('data:')) {
    return {
      descripcion: raw.trabajosRealizados ?? raw.descripcion ?? null,
      media: [{ id: 0, tipo: raw.evidenciaBase64.includes('video') ? 'VIDEO' : 'IMG', url: raw.evidenciaBase64 }],
    };
  }

  return { descripcion: raw?.trabajosRealizados ?? raw?.descripcion ?? null, media: [] };
}

export const apiMedia = {
  porCita: async (citaId: number, token?: string): Promise<ServicioMedia> => {
    // Ajusta el orden a tus rutas reales
    const raw = await tryEndpoints<any>([
      `/mantenimientos/cita/${citaId}`,
      `/citas/${citaId}/evidencias`,
      `/evidencias/cita/${citaId}`,
    ]);
    return toServicioMedia(raw);
  },

  porMantenimiento: async (mantId: number, token?: string): Promise<ServicioMedia> => {
    const raw = await tryEndpoints<any>([
      `/mantenimientos/${mantId}`,
      `/evidencias/mantenimiento/${mantId}`,
    ]);
    return toServicioMedia(raw);
  },
};
