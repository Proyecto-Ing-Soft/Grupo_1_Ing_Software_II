// SRP: consultas de usuarios (listar por rol, etc.)
const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type UsuarioMin = { id: number; nombreCompleto: string };

export const apiUsuarios = {
  async porRol(rol: 'MECANICO', accessToken?: string): Promise<UsuarioMin[]> {
    const res = await fetch(`${BASE}/usuarios?rol=${encodeURIComponent(rol)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
