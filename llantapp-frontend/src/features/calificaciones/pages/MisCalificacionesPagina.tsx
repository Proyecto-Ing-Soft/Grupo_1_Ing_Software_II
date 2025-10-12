// src/features/calificaciones/pages/MisCalificacionesPagina.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCalificaciones } from '../api';
import { Calificacion } from '../type';
import { EstrellasCalificacion } from '../componentes/EstrellasCalificacion';
import './MisCalificacionesPagina.css';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-PE');
  } catch {
    return iso;
  }
}

export default function MisCalificacionesPagina() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Calificacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Carga
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const data = await apiCalificaciones.mias({ page, pageSize }, undefined);
        if (!mounted) return;
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? 'Error al cargar tus calificaciones');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page]);

  // Animación reveal
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e =>
        (e.target as HTMLElement).classList.toggle("animate-in", e.isIntersecting)
      ),
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => { n.dataset.reveal = String(Math.min(i + 1, 5)); obs.observe(n); });
    return () => { window.clearTimeout(t); nodes.forEach(n => obs.unobserve(n)); obs.disconnect(); };
  }, [loading, items.length]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <main className="mcals">
      <header className="mcals__header mcals__stack-lg">
        <div className="mcals__titleWrap reveal" data-reveal="1">
          <h1 className="mcals__title">Mis calificaciones</h1>
          <p className="mcals__sub">Consulta las calificaciones que has registrado.</p>
        </div>

        <div className="mcals__toolbar reveal" data-reveal="2">
          <div className="mcals__actions">
            <button
              type="button"
              className="mc-btn mc-btn--gradient"
              onClick={() => navigate("/inicio")}
              title="Volver al inicio"
            >
              <span className="mc-icon" aria-hidden>⬅️</span>
              <span className="mc-btn__text">Volver al inicio</span>
            </button>
          </div>
        </div>
      </header>

      {loading && (
        <div className="mcals__state reveal" data-reveal="2" role="status" aria-live="polite">
          Cargando…
        </div>
      )}
      {err && !loading && (
        <div className="mcals__state mcals__state--error reveal" data-reveal="2" role="alert">
          {err}
        </div>
      )}

      {!loading && !err && (
        <section className="mcals__content mcals__stack-xl">
          {items.length === 0 ? (
            <div className="mcals__empty reveal" data-reveal="3" role="status">
              <div className="mcals__emptyInner mcals__stack-md">
                <div className="mcals__emptyEmoji" aria-hidden>📝</div>
                <div className="mcals__emptyTitle">Aún no has registrado calificaciones.</div>
                <div className="mcals__emptySub">Cuando califiques un servicio, lo verás aquí.</div>
              </div>
            </div>
          ) : (
            <div className="mcals__list reveal" data-reveal="3">
              {items.map((c, idx) => (
                <article key={c.id} className="mcals__card is-toned" data-reveal={String((idx % 5) + 1)}>
                  <header className="mcals__cardHead">
                    <div className="mcals__meta">
                      <span className="mcals__metaStrong">Cita #{c.citaId}</span> · {formatDate(c.creadaEn)}
                    </div>
                    <EstrellasCalificacion value={c.estrellas} />
                  </header>

                  {c.comentario && <p className="mcals__comment">{c.comentario}</p>}
                </article>
              ))}
            </div>
          )}

          {/* Paginación */}
          {items.length > 0 && (
            <nav className="mcals__pager" aria-label="Paginación">
              <button
                className="mcals__btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                type="button"
              >
                ← Anterior
              </button>
              <div className="mcals__pageInfo">
                Página {page} de {totalPages} · {total} calificación{total === 1 ? '' : 'es'}
              </div>
              <button
                className="mcals__btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                type="button"
              >
                Siguiente →
              </button>
            </nav>
          )}
        </section>
      )}
    </main>
  );
}
