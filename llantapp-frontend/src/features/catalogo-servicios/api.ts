export type Estado = "ACTIVO" | "INACTIVO";
export type Servicio = { id: number; nombre: string; descripcion: string; estado: Estado };

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3001";
const BASE = `${API_URL}/catalogo-servicios`;

function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ServicioBE = { id: number; nombre: string; descripcion: string; activo: boolean };

const toFE = (s: ServicioBE): Servicio => ({
  id: s.id,
  nombre: s.nombre,
  descripcion: s.descripcion,
  estado: s.activo ? "ACTIVO" : "INACTIVO",
});

const toBE = (f: Partial<Servicio>) => ({
  nombre: (f.nombre ?? "").trim(),
  descripcion: (f.descripcion ?? "").trim(),
  activo: (f.estado ?? "ACTIVO") === "ACTIVO",
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
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseHttpError(text));
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const apiCatalogoServicios = {
  async listar(): Promise<Servicio[]> {
    const data = await http<ServicioBE[]>(`${BASE}`, { method: "GET" });
    return data.map(toFE);
  },

  async crear(payload: { nombre: string; descripcion: string; estado?: Estado }): Promise<Servicio> {
    const creado = await http<ServicioBE>(`${BASE}`, {
      method: "POST",
      body: JSON.stringify(toBE(payload)),
    });
    return toFE(creado);
  },

  async actualizar(
    id: number,
    payload: { nombre: string; descripcion: string; estado: Estado }
  ): Promise<Servicio> {
    const actualizado = await http<ServicioBE>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(toBE(payload)),
    });
    return toFE(actualizado);
  },

  async cambiarEstado(id: number, activo: boolean): Promise<void> {
    await http<void>(`${BASE}/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    });
  },
};
