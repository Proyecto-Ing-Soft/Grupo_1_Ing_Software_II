export async function obtenerParametros() {
  const res = await fetch('http://localhost:3000/api/parametros');
  if (!res.ok) throw new Error("Error al obtener parámetros");
  return await res.json();
}
