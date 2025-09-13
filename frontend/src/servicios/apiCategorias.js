const API_URL = 'http://localhost:3000/api/categoria';

export async function crearCategoria({ nombre_categoria, imagen_url, id_usuario, rol }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      id_usuario,
      rol
    },
    body: JSON.stringify({ nombre_categoria, imagen_url })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.mensaje || 'Error al agregar categoría');
  }
  return data;
}


export async function obtenerCategorias() {
  const res = await fetch("http://localhost:3000/api/categoria");
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
}




