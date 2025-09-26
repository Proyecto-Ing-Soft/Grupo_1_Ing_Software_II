// SRP: Único responsable de llamar a endpoints de autenticación.
// DRY: Reutiliza la misma instancia base para todas las llamadas.
// KISS: fetch nativo; se puede cambiar a Axios sin tocar los consumidores (OCP).

// servicios/apiAuth.ts
const BASE = import.meta.env.VITE_API_BASE_URL as string;

type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';

export interface Perfil {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: Rol;
}

// --- Helpers DRY --- //
async function postJSON(ruta: string, cuerpo: unknown) {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // cookie httpOnly para refresh
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) {
    const texto = await res.text().catch(() => '');
    throw new Error(texto || 'Error en la petición');
  }
  return res.json();
}

async function getJSONAutorizado<T>(ruta: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`, // JWT en Authorization
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const texto = await res.text().catch(() => '');
    throw new Error(texto || 'Error en la petición');
  }
  return res.json();
}

// --- Fachada de Auth --- //
export const apiAuth = {
  registrar: (datos: { nombreCompleto: string; correo: string; clave: string }) =>
    postJSON('/auth/registrar', datos),

  login: (datos: { correo: string; clave: string }) =>
    postJSON('/auth/login', datos) as Promise<{ accessToken: string }>,

  refresh: () =>
    postJSON('/auth/refresh', {}) as Promise<{ accessToken: string }>,

  // 👇 Nuevo: obtener perfil del usuario autenticado
  perfil: (accessToken: string) =>
    getJSONAutorizado<Perfil>('/auth/perfil', accessToken),
};

