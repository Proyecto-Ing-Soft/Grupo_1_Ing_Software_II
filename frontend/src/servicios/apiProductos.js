const API_URL = 'http://localhost:3000/api/producto';

export async function obtenerProductos(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}?${query}`);
  if (!res.ok) throw new Error("Error al obtener productos");
  return await res.json();
}

export async function obtenerProductosActivos() {
  const res = await fetch(`${API_URL}/activos`);
  if (!res.ok) throw new Error("Error al obtener productos activos");
  return await res.json();
}

export async function obtenerDetalleProducto(id) {
  const res = await fetch(`${API_URL}/detalle/${id}`);
  if (!res.ok) throw new Error("Error al obtener detalle de producto");
  return await res.json();
}

export async function agregarProducto(data, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      id_usuario: token?.id_usuario || '',
      rol: token?.rol || ''
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al agregar producto");
  return await res.json();
}

export async function actualizarProducto(id, data, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      id_usuario: token?.id_usuario || '',
      rol: token?.rol || ''
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar producto");
  return await res.json();
}

export async function cambiarEstadoProducto(idProducto, usuario) {
  const response = await fetch(`http://localhost:3000/api/producto/${idProducto}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "id_usuario": usuario.id_usuario
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al cambiar el estado del producto");
  }

  return data;
}

export async function obtenerProductosDestacados() {
  const res = await fetch(`${API_URL}/destacado`);
  if (!res.ok) throw new Error("Error al obtener productos destacados");
  return await res.json();
}

export async function obtenerProductosNuevos() {
  const res = await fetch(`${API_URL}/reciente`);
  if (!res.ok) throw new Error("Error al obtener productos recientes");
  return await res.json();
}

export async function buscarProductos(termino, orden = 'nombre') {
  const params = new URLSearchParams({ q: termino, orden });
  const res = await fetch(`${API_URL}/buscar?${params}`);
  if (!res.ok) throw new Error("Error al buscar productos");
  return await res.json();
}

export async function obtenerTallasCamiseta(idCamiseta) {
  const res = await fetch(`${API_URL}/camiseta/${idCamiseta}/tallas`);
  if (!res.ok) throw new Error("Error al obtener tallas de la camiseta");
  return await res.json();
}

export async function obtenerProductosPorCategoria(idCategoria, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/categoria/${idCategoria}?${query}`);
  if (!res.ok) throw new Error("Error al obtener productos por categoría");
  return await res.json();
}

