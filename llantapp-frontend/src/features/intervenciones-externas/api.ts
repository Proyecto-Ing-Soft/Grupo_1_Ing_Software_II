export type Intervencion = {
  id: number;
  vehiculoId: number;
  fecha: string;
  descripcion: string;
  comprobanteUrl: string | null;
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3001";
const BASE = `${API_URL}/intervenciones`;

function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type IntervencionBE = {
  id: number;
  vehiculoId: number;
  fecha: string;
  descripcion: string;
  comprobanteUrl: string | null;
  vehiculo?: { placa: string; alias?: string | null };
};

const toFE = (i: IntervencionBE): Intervencion => ({
  id: i.id,
  vehiculoId: i.vehiculoId,
  fecha: i.fecha,
  descripcion: i.descripcion,
  comprobanteUrl: i.comprobanteUrl ?? null,
});

export function parseHttpError(raw: string): string {
  try {
    const obj = JSON.parse(raw);
    if (obj?.message) {
      return Array.isArray(obj.message) ? obj.message.join(", ") : String(obj.message);
    }
  } catch {}
  return raw || "Error en la operación";
}

async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseHttpError(text));
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const apiIntervencionesExternas = {
  async listarMias(): Promise<Intervencion[]> {
    const data = await http<IntervencionBE[]>(`${BASE}/mias`, { method: "GET" });
    return data.map(toFE);
  },

  async crear(payload: {
    vehiculoId: number;
    fechaIso: string;
    descripcion: string;
    comprobanteUrl?: string;
  }): Promise<Intervencion> {
    const creado = await http<IntervencionBE>(`${BASE}`, {
      method: "POST",
      body: JSON.stringify({
        vehiculoId: payload.vehiculoId,
        fecha: payload.fechaIso,
        descripcion: payload.descripcion.trim(),
        comprobanteUrl: (payload.comprobanteUrl ?? "").trim() || null,
      }),
    });
    return toFE(creado);
  },
};
