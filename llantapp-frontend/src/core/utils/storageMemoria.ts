// SRP: una sola responsabilidad (gestionar access token)
// KISS: API mínima get/set/limpiar
const KEY = 'access_token';
let _mem: string | null = null;

export const tokenMemoria = {
  get: () => _mem ?? localStorage.getItem(KEY),
  set: (t: string) => { _mem = t; localStorage.setItem(KEY, t); },
  limpiar: () => { _mem = null; localStorage.removeItem(KEY); },
};
