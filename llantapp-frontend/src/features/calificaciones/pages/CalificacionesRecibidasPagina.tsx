import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCalificaciones } from "../api";
import { EstrellasCalificacion } from "../componentes/EstrellasCalificacion";
import "./calificacionesRecibidas.css";

type Item = {
  id: number;
  citaId: number;
  clienteId: number;
  estrellas: number;
  comentario?: string | null;
  creadaEn: string;
  cita?: {
    id: number;
    estado: string;
    fechaMantenimiento?: string | null;
    placaPreliminar?: string | null;
    marcaPreliminar?: string | null;
    modeloPreliminar?: string | null;
  } | null;
  cliente?: { id: number; nombreCompleto: string } | null;
};

function fmtFecha(s?: string | null) {
  return s ? new Date(s).toLocaleString("es-PE") : "—";
}

export default function CalificacionesRecibidasPagina() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiCalificaciones.recibidas({ page, pageSize });
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      setErr(e?.message ?? "Error al cargar calificaciones recibidas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [page]);

  // Animaciones reveal
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  return (
    <main className="cr">
      <header className="cr__header cr__stack-lg">
        <div className="cr__titleWrap reveal" data-reveal="1">
          <h1 className="cr__title">Calificaciones recibidas</h1>
          <p className="cr__sub">Revisa los comentarios y las estrellas que te han dejado tus clientes.</p>
        </div>

        <div className="cr__toolbar reveal" data-reveal="2">
          <div className="cr__actions">
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
        <div className="cr__state reveal" data-reveal="2" role="status" aria-live="polite">
          Cargando…
        </div>
      )}

      {err && !loading && (
        <div className="cr__state cr__state--error reveal" data-reveal="2" role="alert">
          {err}
        </div>
      )}

      {!loading && !err && (
        <section className="cr__content cr__stack-xl">
          {items.length === 0 ? (
            <div className="cr__empty reveal" data-reveal="3" role="status" aria-live="polite">
              <div className="cr__emptyInner cr__stack-md">
                <div className="cr__emptyEmoji" aria-hidden>⭐</div>
                <div className="cr__emptyTitle">Aún no has recibido calificaciones</div>
                <div className="cr__emptySub">Cuando un cliente te califique, aparecerá aquí.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="cr__list reveal" data-reveal="3" role="list">
                {items.map((it, idx) => (
                  <article
                    key={it.id}
                    className="cr__card is-toned"
                    role="listitem"
                    data-reveal={String((idx % 5) + 1)}
                  >
                    <header className="cr__row">
                      <div className="cr__meta">
                        <span className="metaItem">
                          <strong>Cita&nbsp;#{it.citaId}</strong>
                        </span>
                        {it.cita?.placaPreliminar && (
                          <span className="metaItem">Placa: {it.cita.placaPreliminar}</span>
                        )}
                        {it.cita?.fechaMantenimiento && (
                          <span className="metaItem">{fmtFecha(it.cita.fechaMantenimiento)}</span>
                        )}
                        {it.cliente?.nombreCompleto && (
                          <span className="metaItem">Cliente: {it.cliente.nombreCompleto}</span>
                        )}
                      </div>
                      <div className="cr__stars" aria-label={`${it.estrellas} estrellas`}>
                        <EstrellasCalificacion value={it.estrellas} />
                      </div>
                    </header>

                    {it.comentario && (
                      <p className="cr__coment">{it.comentario}</p>
                    )}

                    <footer className="cr__foot">
                      Recibida: {fmtFecha(it.creadaEn)}
                    </footer>
                  </article>
                ))}
              </div>

              <nav className="cr__pager reveal" data-reveal="4" aria-label="Paginación">
                <button
                  className="btnGhost"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ← Anterior
                </button>
                <div className="cr__pageInfo">
                  Página {page} de {totalPages} · {total} calificación{total === 1 ? "" : "es"}
                </div>
                <button
                  className="btnGhost"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Siguiente →
                </button>
              </nav>
            </>
          )}
        </section>
      )}
    </main>
  );
}
