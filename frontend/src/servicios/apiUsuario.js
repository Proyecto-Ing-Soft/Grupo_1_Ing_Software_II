const URL_BASE = 'http://localhost:3000/api/usuario';

export async function cambiarPassword(id_usuario, nuevaPassword) {
  try {
    const res = await fetch(`${URL_BASE}/${id_usuario}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'id_usuario': id_usuario
      },
      body: JSON.stringify({ password: nuevaPassword })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.error || 'Error al actualizar');
    }

    return { success: true };
  } catch (error) {
    return { success: false, mensaje: error.message };
  }
}

export async function obtenerDatosUsuario(id_usuario) {
  try {
    const res = await fetch(`${URL_BASE}/${id_usuario}`, {
      headers: {
        'Content-Type': 'application/json',
        'id_usuario': id_usuario
      }
    });

    if (!res.ok) throw new Error('No se pudo obtener datos del usuario');

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, mensaje: error.message };
  }
}

// 📌 NUEVA FUNCIÓN: Actualizar datos de perfil
export async function actualizarDatosUsuario(id_usuario, nombre, apellido, correo) {
  try {
    const res = await fetch(`${URL_BASE}/${id_usuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'id_usuario': id_usuario
      },
      body: JSON.stringify({ nombre, apellido, correo })
    });

    if (!res.ok) throw new Error('Error al actualizar');

    return { success: true };
  } catch (error) {
    return { success: false, mensaje: error.message };
  }
}
