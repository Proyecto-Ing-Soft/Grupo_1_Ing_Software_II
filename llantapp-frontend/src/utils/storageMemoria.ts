// KISS: almacenar el access token en memoria (no localStorage) para reducir riesgo XSS.
// YAGNI: sin persistencia entre recargas por ahora.

let accessTokenEnMemoria: string | null = null;

export const tokenMemoria = {
  set(token: string | null) { accessTokenEnMemoria = token; },
  get() { return accessTokenEnMemoria; },
  limpiar() { accessTokenEnMemoria = null; }
};
