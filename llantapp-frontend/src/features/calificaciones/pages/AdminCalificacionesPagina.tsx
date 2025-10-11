import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCalificaciones } from '../api';
import './AdminCalificacionesPagina.css';

type Dist = { estrellas: number; total: number };
type TopMec = { mecanicoId: number; nombre: string; promedio: number; n: number };
type Stats = {
  promedioGlobal?: number;
  totalCalificaciones?: number;
  distribucion?: Dist[];
  promedioPorMecanico?: TopMec[];
};

export default function AdminCalificacionesPagina() {
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filtros
  const [fMecanico, setFMecanico] = useState('');
  const [fEstrellas, setFEstrellas] = useState('');
  const [fPlaca, setFPlaca] = useState('');
  const [fDesde, setFDesde] = useState('');
  const [fHasta, setFHasta] = useState('');

  const cargar = async () => {
    setLoading(true);
    setErr(null);
    try {
      const list = await apiCalificaciones.adminList({
        page,
        pageSize,
        mecanicoId: fMecanico ? Number(fMecanico) : undefined,
        estrellas: fEstrellas ? Number(fEstrellas) : undefined,
        placa: fPlaca || undefined,
        desde: fDesde || undefined,
        hasta: fHasta || undefined,
      });
      setItems(list.items ?? []);
      setTotal(list.total ?? 0);

      const s = await apiCalificaciones.adminStats();
      setStats(s);
    } catch (e: any) {
      setErr(e?.message ?? 'Error al cargar calificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : '—');
  const starText = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  const resetFiltros = () => {
    setFMecanico('');
    setFEstrellas('');
    setFPlaca('');
    setFDesde('');
    setFHasta('');
    setPage(1);
    cargar();
  };

  const aplicarFiltros = () => {
    setPage(1);
    cargar();
  };

  return (
    <main className="calif-page">
      <header className="calif-header">
        <div className="calif-titlewrap">
          <h1 className="title">Calificaciones (Admin)</h1>
        </div>
        <div className="calif-actions">
          <button
            type="button"
            className="mc-btn mc-btn--gradient"
            onClick={() => navigate('/inicio')}
            title="Volver al inicio"
          >
            <span className="mc-icon" aria-hidden>⬅️</span>
            <span className="mc-btn__text">Volver al inicio</span>
          </button>
        </div>
      </header>

      {/* Filtros */}
      <section className="filters card fade-in" aria-label="Filtros de búsqueda">
        <div className="filters-grid">
          <input
            className="input"
            placeholder="ID Mecánico"
            value={fMecanico}
            onChange={(e) => setFMecanico(e.target.value)}
            inputMode="numeric"
          />
          <select
            className="input"
            value={fEstrellas}
            onChange={(e) => setFEstrellas(e.target.value)}
          >
            <option value="">Estrellas</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Placa"
            value={fPlaca}
            onChange={(e) => setFPlaca(e.target.value)}
          />
          <input
            type="date"
            className="input"
            value={fDesde}
            onChange={(e) => setFDesde(e.target.value)}
          />
          <input
            type="date"
            className="input"
            value={fHasta}
            onChange={(e) => setFHasta(e.target.value)}
          />
        </div>

        <div className="filters-actions">
          <button className="btn btn-soft" onClick={aplicarFiltros}>
            Aplicar filtros
          </button>
          <button className="btn btn-soft-ghost" onClick={resetFiltros}>
            Limpiar
          </button>
        </div>
      </section>

      {loading && <p className="muted">Cargando…</p>}
      {err && <p className="error">{err}</p>}

      {/* Stats */}
      {stats && (
        <section className="stats-grid" aria-label="Estadísticas">
          <div className="card fade-in">
            <div className="muted small">Promedio global</div>
            <div className="stat-big">
              {typeof stats.promedioGlobal === 'number'
                ? stats.promedioGlobal.toFixed(2)
                : '0.00'}{' '}
              <span className="stars-inline">★</span>
            </div>
            <div className="muted xsmall">
              {stats.totalCalificaciones ?? 0} calificaciones
            </div>
          </div>

          <div className="card fade-in">
            <div className="stat-title">Distribución</div>
            <ul className="list">
              {(stats.distribucion ?? []).length === 0 && (
                <li className="muted small">Sin datos</li>
              )}
              {(stats.distribucion ?? []).map((d) => (
                <li key={d.estrellas} className="list-row">
                  <span className="stars-inline">{starText(d.estrellas)}</span>
                  <span className="list-badge">{d.total}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card fade-in">
            <div className="stat-title">Top mecánicos</div>
            <ol className="list numbered">
              {(stats.promedioPorMecanico ?? []).length === 0 && (
                <li className="muted small">Sin datos</li>
              )}
              {(stats.promedioPorMecanico ?? []).slice(0, 5).map((m) => (
                <li key={m.mecanicoId} className="list-row">
                  <span className="grow">
                    {m.nombre}: {m.promedio?.toFixed?.(2) ?? '—'}{' '}
                    <span className="stars-inline">★</span>
                  </span>
                  <span className="muted small">({m.n})</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Tabla */}
      {!loading && (
        <div className="table-wrap fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cita</th>
                <th>Mecánico</th>
                <th>Cliente</th>
                <th>Placa</th>
                <th>★</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{fmt(it.creadaEn)}</td>
                  <td>#{it.citaId}</td>
                  <td>{it?.cita?.mecanico?.nombreCompleto ?? '—'}</td>
                  <td>{it?.cliente?.nombreCompleto ?? '—'}</td>
                  <td>{it?.cita?.placaPreliminar ?? '—'}</td>
                  <td className="nowrap">
                    <span className="stars-inline" aria-label={`${it.estrellas} estrellas`}>
                      {starText(it.estrellas ?? 0)}
                    </span>
                  </td>
                  <td className="comment">{it.comentario ?? ''}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted center">
                    No hay registros para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="pagination">
        <button
          className="btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← Anterior
        </button>
        <div className="muted small">
          Página {page} de {totalPages} · {total} registros
        </div>
        <button
          className="btn"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Siguiente →
        </button>
      </div>
    </main>
  );
}
