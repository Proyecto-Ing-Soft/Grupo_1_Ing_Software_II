export async function obtenerKPIs() {
  const res = await fetch("http://localhost:3000/api/dashboard/kpis");
  if (!res.ok) throw new Error("Error al obtener KPIs");
  return res.json();
}
