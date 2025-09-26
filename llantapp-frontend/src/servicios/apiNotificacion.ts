// src/servicios/servicioApi.ts
export class ServicioApi {
  private base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/";

  async post<T>(ruta: string, cuerpo: unknown, token?: string): Promise<T> {
    const r = await fetch(`${this.base}${ruta}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(cuerpo),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async get<T>(ruta: string, token?: string): Promise<T> {
    const r = await fetch(`${this.base}${ruta}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  // 🔽 Añadidos para CU-03 (SRP: métodos específicos para notificaciones)
  async getMisNotificaciones<T>(token: string): Promise<T> {
    return this.get<T>('/notificaciones/mias', token);
  }

  async marcarNotificacionLeida<T>(id: number, token: string): Promise<T> {
    return this.post<T>(`/notificaciones/${id}/marcar-leida`, {}, token);
  }
}
export const api = new ServicioApi();
