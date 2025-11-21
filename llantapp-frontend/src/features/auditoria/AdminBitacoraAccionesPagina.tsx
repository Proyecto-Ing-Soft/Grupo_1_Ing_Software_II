import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiAuditoria, AccionBitacora } from "./apiAuditoria";
import "./adminBitacoraAcciones.css";

export default function AdminBitacoraAccionesPagina() {
  const navigate = useNavigate();

  const [acciones, setAcciones] = useState<AccionBitacora[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citaIdFiltro, setCitaIdFiltro] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);

  useEffect(() => {
    cargarAcciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarAcciones = async (opts?: { citaId?: number; limit?: number }) => {
    try {
      setCargando(true);
      setError(null);
      const data = await apiAuditoria.listarAcciones({
        citaId: opts?.citaId,
        limit: opts?.limit ?? limit,
      });
      setAcciones(data ?? []);
    } catch (e: any) {
      setError(e?.message || "Error cargando la bitácora de acciones");
    } finally {
      setCargando(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cid = citaIdFiltro.trim() ? Number(citaIdFiltro.trim()) : undefined;
    cargarAcciones({ citaId: cid, limit });
  };

  const fmtFechaHora = (iso: string) =>
    new Date(iso).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <main className="bitac">
      <section className="bitac__panel">
        <header className="bitac__head">
          <div>
            <h1 className="bitac__title">Bitácora de acciones</h1>
            <p className="bitac__sub">
              Visualiza quién creó citas, quién asignó mecánicos y cuándo se ejecutaron las acciones.
            </p>
          </div>

          <div className="bitac__toolbar">
            <button
              type="button"
              className="bitac-btn bitac-btn--ghost"
              onClick={() => navigate("/inicio")}
            >
              <span aria-hidden>⬅️</span>
              <span>Volver al inicio</span>
            </button>
          </div>
        </header>

        <form className="bitac__filters" onSubmit={onSubmit}>
          <div className="bitac__field">
            <label htmlFor="citaId" className="bitac__label">
              Filtrar por ID de cita
            </label>
            <input
              id="citaId"
              className="bitac__input"
              placeholder="Ej: 101"
              value={citaIdFiltro}
              onChange={(e) => setCitaIdFiltro(e.target.value)}
            />
          </div>

          <div className="bitac__field bitac__field--small">
            <label htmlFor="limit" className="bitac__label">
              Máx. registros
            </label>
            <select
              id="limit"
              className="bitac__input"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 50)}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="bitac__actions">
            <button type="submit" className="bitac-btn bitac-btn--primary">
              🔍 Aplicar filtros
            </button>
            <button
              type="button"
              className="bitac-btn bitac-btn--soft"
              onClick={() => {
                setCitaIdFiltro("");
                setLimit(50);
                cargarAcciones({ limit: 50 });
              }}
            >
              ↺ Limpiar
            </button>
          </div>
        </form>

        {cargando && (
          <div className="bitac__state" role="status">
            Cargando bitácora…
          </div>
        )}

        {error && !cargando && (
          <div className="bitac__state bitac__state--error" role="alert">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <>
            {acciones.length === 0 ? (
              <div className="bitac__state" role="status">
                No se encontraron acciones con los filtros actuales.
              </div>
            ) : (
              <div className="bitac__tableWrap">
                <table className="bitac__table">
                  <thead>
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Acción</th>
                      <th>Descripción</th>
                      <th>Usuario</th>
                      <th>Cita</th>
                      <th>Mecánico ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acciones.map((a) => (
                      <tr key={a.id}>
                        <td>{fmtFechaHora(a.creadoEn)}</td>
                        <td>
                          <span className="bitac__tag">{a.tipo}</span>
                        </td>
                        <td className="bitac__desc">{a.descripcion}</td>
                        <td>
                          #{a.usuario.id} · {a.usuario.nombreCompleto}
                        </td>
                        <td>
                          {a.cita
                            ? `#${a.cita.id} · ${a.cita.tipo} · ${a.cita.estado}`
                            : "—"}
                        </td>
                        <td>{a.mecanicoId ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
