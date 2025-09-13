export function obtenerUsuario() {
  return localStorage.getItem("usuario") || null;
}

export function estaLogueado() {
  return obtenerUsuario() !== null;
}

export function esAdmin() {
  const user = obtenerUsuario();
  return user && user.toLowerCase().includes("admin");
}

export function esUsuarioComun() {
  return estaLogueado() && !esAdmin();
}