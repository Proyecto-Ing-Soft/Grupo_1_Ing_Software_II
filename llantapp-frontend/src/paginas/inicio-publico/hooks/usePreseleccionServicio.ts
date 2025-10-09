export type PreSelServicio = { slug: string; nombre: string };

const KEY = "llantapp.preSelServicio";

export function setPreSeleccion(servicio: PreSelServicio) {
  try { localStorage.setItem(KEY, JSON.stringify(servicio)); } catch {}
}
export function getPreSeleccion(): PreSelServicio | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as PreSelServicio : null;
  } catch { return null; }
}
export function clearPreSeleccion(){ try { localStorage.removeItem(KEY); } catch {} }
