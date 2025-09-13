const API = "http://localhost:3000/api/carrito";

export async function obtenerCarrito(id_usuario) {
  const res = await fetch(API, {
    headers: { "id_usuario": id_usuario }
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Respuesta no válida del servidor: " + text);
  }
}


export async function agregarProductoAlCarrito(id_usuario, id_producto, cantidad) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "id_usuario": id_usuario },
    body: JSON.stringify({ id_producto, cantidad })
  });
  return await res.json();
}


export async function actualizarCantidadCarrito(id_carrito, id_producto, cantidad, id_usuario) {
  const res = await fetch(`${API}/producto/${id_producto}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "id_usuario": id_usuario },
    body: JSON.stringify({ id_carrito, cantidad })
  });
  return await res.json();
}

export async function eliminarDelCarrito(id_carrito, id_producto, id_usuario) {
  const res = await fetch(`${API}/producto/${id_producto}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "id_usuario": id_usuario
    },
    body: JSON.stringify({ id_carrito }) 
  });
  return await res.json();
}
