const BASE_URL = 'http://localhost:3000/api/guardado';

export async function obtenerProductosGuardados(id_usuario) {
  const res = await fetch(BASE_URL, {
    headers: { id_usuario }
  });
  if (!res.ok) throw new Error('Error al obtener productos guardados');
  return await res.json();
}

export async function moverProductoAGuardado(id_producto, id_usuario) {
  const res = await fetch(`${BASE_URL}/mover-guardado/${id_producto}`, {
    method: 'PUT',
    headers: { id_usuario }
  });
  if (!res.ok) throw new Error('Error al mover a guardado');
}

export async function moverProductoAlCarrito(id_producto, id_usuario) {
  const res = await fetch(`${BASE_URL}/mover-carrito/${id_producto}`, {
    method: 'PUT',
    headers: { id_usuario }
  });
  if (!res.ok) throw new Error('Error al mover al carrito');
}

export async function eliminarProductoGuardado(id_producto, id_usuario) {
  const res = await fetch(`${BASE_URL}/${id_producto}`, {
    method: 'DELETE',
    headers: { id_usuario }
  });
  if (!res.ok) throw new Error('Error al eliminar producto guardado');
}
