import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCitas, ResumenTecnico } from "./api";
import "./resumenTecnico.css";

export default function ResumenTecnicoPagina() {
  const { citaId } = useParams<{ citaId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ResumenTecnico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    if (!citaId) return;
    (async () => {
      try {
        setLoading(true);
        const r = await apiCitas.resumenTecnico(Number(citaId));
        setData(r);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "No se pudo cargar el resumen técnico.");
      } finally {
        setLoading(false);
      }
    })();
  }, [citaId]);

  const copiar = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.resumenTexto);
      setCopyError(null);
      setCopiado(true);
      // Oculta el mensaje después de unos segundos
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopyError("No se pudo copiar el resumen.");
    }
  };

  if (loading) return <main className="rt-page">Cargando resumen…</main>;
  if (error) return <main className="rt-page">Error: {error}</main>;
  if (!data) return <main className="rt-page">Sin datos.</main>;

  return (
    <main className="rt-page">
      <div className="rt-card">
        <header className="rt-head">
          <h1>Resumen técnico – Cita #{data.citaId}</h1>
          <p>
            Consulta el detalle del trabajo realizado y copia el resumen para compartirlo.
          </p>

          <div className="rt-actions">
            <button type="button" onClick={() => navigate(-1)}>
              ⬅️ Volver
            </button>
            <button type="button" onClick={copiar}>
              📋 Copiar resumen
            </button>

            {copiado && (
              <span className="rt-copyBadge" role="status">
                Resumen copiado ✓
              </span>
            )}
          </div>

          {copyError && <div className="rt-errorMsg">{copyError}</div>}
        </header>

        <section className="rt-section">
          <h2>Vehículo</h2>
          <p>
            <strong>Placa:</strong> {data.vehiculo.placa ?? "—"}
          </p>
          <p>
            <strong>Modelo:</strong>{" "}
            {data.vehiculo.marca} {data.vehiculo.modelo}{" "}
            {data.vehiculo.anio ? `(${data.vehiculo.anio})` : ""}
          </p>
        </section>

        <section className="rt-section">
          <h2>Participantes</h2>
          <p>
            <strong>Cliente:</strong> {data.cliente?.nombreCompleto ?? "—"}
          </p>
          <p>
            <strong>Mecánico:</strong> {data.mecanico?.nombreCompleto ?? "—"}
          </p>
        </section>

        <section className="rt-section">
          <h2>Trabajos realizados</h2>
          <pre className="rt-pre">
            {data.trabajosRealizados?.trim() || "Sin detalle registrado."}
          </pre>
        </section>

        <section className="rt-section">
          <h2>Repuestos utilizados</h2>
          {data.repuestos.length === 0 ? (
            <p>Sin repuestos registrados.</p>
          ) : (
            <ul>
              {data.repuestos.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
