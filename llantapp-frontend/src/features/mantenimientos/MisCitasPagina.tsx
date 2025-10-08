import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiCitas } from "./api";
import "./miscitas.css";

type Cita = {
  id: number;
  tipo: string;
  estado: string;
  comentario?: string | null;
  programadaPara?: string | null;
  vehiculo?: { placa?: string | null } | null;
};

export default function MisCitasPagina() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        const data = await apiCitas.mias();
        setCitas((data ?? []) as Cita[]);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || "Error cargando tus citas");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);

    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) el.classList.add("animate-in");
        else el.classList.remove("animate-in");
      }
    }, { threshold: 0.12 });

    nodes.forEach((n, i) => {
      n.dataset.reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });

    return () => {
      window.clearTimeout(t);
      nodes.forEach(n => obs.unobserve(n));
      obs.disconnect();
    };
  }, [cargando, citas.length]);

  const fmtSoloFecha = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "Sin fecha";

  return (
    <main className="mc">
      <header className="mc__header mc__stack-lg">
        <div className="mc__titleWrap reveal" data-reveal="1">
          <h1 className="mc__title">Mis citas</h1>
          <p className="mc__sub">
            Revisa el estado de tus atenciones. Puedes agendar una nueva cita cuando lo necesites.
          </p>
        </div>

        <div className="mc__toolbar reveal" data-reveal="2">
          <div className="mc__actions">
            <button
              type="button"
              onClick={() => navigate("/inicio")}
              className="mc-btn mc-btn--gradient"
              title="Volver al inicio"
            >
              <span className="mc-icon" aria-hidden>⬅️</span>
              <span className="mc-btn__text">Volver al inicio</span>
            </button>
          </div>
        </div>
      </header>

      {cargando && (
        <div className="mc__state reveal" data-reveal="2" role="status" aria-live="polite">
          Cargando…
        </div>
      )}
      {err && !cargando && (
        <div className="mc__state mc__state--error reveal" data-reveal="2" role="alert">
          {err}
        </div>
      )}

      {!cargando && !err && (
        <section className="mc__content mc__stack-xl">
          {citas.length > 0 && (
            <div className="mc__grid reveal" data-reveal="3" role="list">
              {citas.map((c, idx) => (
                <article
                  key={c.id}
                  role="listitem"
                  className="mc__card"
                  data-reveal={String((idx % 5) + 1)}
                >
                  <div className="mc__cardMain">
                    <div className="mc__headline">
                      <span className="mc__id">#{c.id}</span>
                      <span className="mc__tipo">{c.tipo}</span>
                      {c.vehiculo?.placa && <span className="mc__placa">{c.vehiculo.placa}</span>}
                    </div>
                    <div className="mc__meta">
                      <span className="mc__metaItem">🗓 {fmtSoloFecha(c.programadaPara)}</span>
                      {c.comentario && <span className="mc__metaItem">💬 {c.comentario}</span>}
                    </div>
                  </div>
                  <span className={`mc__chip mc__chip--${String(c.estado || "").toLowerCase()}`}>
                    {c.estado}
                  </span>
                </article>
              ))}
            </div>
          )}

          {citas.length === 0 && (
            <>
              <div className="mc__empty reveal" data-reveal="3" role="status" aria-live="polite">
                <div className="mc__emptyInner mc__stack-md">
                  <div className="mc__emptyEmoji" aria-hidden>📭</div>
                  <div className="mc__emptyTitle">No tienes citas</div>
                  <div className="mc__emptySub">Cuando agendes, las verás aquí.</div>
                </div>
              </div>

              <div className="mc__ctaRow reveal" data-reveal="4">
                <Link to="/citas/agendar" className="mc-btn mc-btn--gradient">
                  <span className="mc-icon" aria-hidden>📅</span>
                  <span className="mc-btn__text">Agendar una cita</span>
                </Link>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
