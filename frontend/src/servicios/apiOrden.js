const URL_BASE = 'http://localhost:3000/api/orden';

export async function obtenerDetalleOrden(idOrden, idUsuario) {
  try {
    const res = await fetch(`${URL_BASE}/detalle/${idOrden}`, {
      headers: { id_usuario: idUsuario }
    });

    const data = await res.json();

    if (!res.ok) throw new Error('No se encontró la orden');
    return { success: true, data };
  } catch (error) {
    return { success: false, mensaje: error.message || 'Error al cargar detalles' };
  }
}

export async function cancelarOrden(idOrden, idUsuario) {
  try {
    const res = await fetch(`${URL_BASE}/cancelar/${idOrden}`, {
      method: 'PUT',
      headers: { id_usuario: idUsuario }
    });

    if (!res.ok) throw new Error('No se pudo cancelar');
    return { success: true };
  } catch (error) {
    return { success: false, mensaje: error.message || 'Error en el servidor' };
  }
}
