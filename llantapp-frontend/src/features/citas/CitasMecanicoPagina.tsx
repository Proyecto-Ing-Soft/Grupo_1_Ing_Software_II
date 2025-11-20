import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCitas } from "./api";
import "./citasMecanico.css";

type Cita = {
  id: number;
  fechaProgramada?: string | null;
  comentario?: string | null;
  vehiculo?: { placa?: string | null } | null;
  servicio?: { nombre?: string | null } | null;
  estado?: { codigo?: string | null } | null;
  cliente?: { nombreCompleto?: string | null } | null;
};

export default function CitasMecanicoPagina() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const recargar = async () => {
    try {
      setCargando(true);
      const data = await apiCitas.asignadas();
      setCitas((data ?? []) as Cita[]);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || "Error cargando citas asignadas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargar();
  }, []);

  // Animaciones reveal
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach((n) => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          (e.target as HTMLElement).classList.toggle("animate-in", e.isIntersecting)
        ),
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => {
      n.dataset.reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });
    return () => {
      window.clearTimeout(t);
      nodes.forEach((n) => obs.unobserve(n));
      obs.disconnect();
    };
  }, [cargando, citas.length]);

  const onTerminar = async (id: number) => {
    try {
      await apiCitas.terminar(id);
      await recargar();
    } catch (e: any) {
      setErr(e?.message || "No se pudo terminar la cita");
    }
  };

  const fmtSoloFecha = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "Sin fecha";

  const hoyYMD = new Date().toISOString().slice(0, 10);

  return (
    <main className="cm">
      <header className="cm__header cm__stack-lg">
        <div className="cm__titleWrap reveal" data-reveal="1">
          <h1 className="cm__title">Citas asignadas</h1>
          <p className="cm__sub">Atiende y finaliza las citas programadas para hoy.</p>
        </div>

        <div className="cm__toolbar reveal" data-reveal="2">
          <div className="cm__actions">
            <button
              type="button"
              className="mc-btn mc-btn--gradient"
              onClick={() => navigate("/inicio")}
              title="Volver al inicio"
            >
              <span className="mc-icon" aria-hidden>
                ⬅️
              </span>
              <span className="mc-btn__text">Volver al inicio</span>
            </button>
            <button
              type="button"
              className="btnGhost"
              onClick={recargar}
              title="Actualizar lista"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </header>

      {cargando && (
        <div className="cm__state reveal" data-reveal="2" role="status" aria-live="polite">
          Cargando…
        </div>
      )}

      {err && !cargando && (
        <div className="cm__state cm__state--error reveal" data-reveal="2" role="alert">
          {err}
        </div>
      )}

      {!cargando && !err && (
        <section className="cm__content cm__stack-xl">
          {citas.length === 0 ? (
            <div className="cm__empty reveal" data-reveal="3" role="status">
              <div className="cm__emptyInner cm__stack-md">
                <div className="cm__emptyEmoji" aria-hidden>
                  🧰
                </div>
                <div className="cm__emptyTitle">No tienes citas asignadas</div>
                <div className="cm__emptySub">Cuando te asignen una, aparecerá aquí.</div>
              </div>
            </div>
          ) : (
            <div className="cm__grid reveal" data-reveal="3" role="list">
              {citas.map((c, idx) => {
                const estadoCodigo = (c.estado?.codigo || "").toLowerCase(); // p.ej. "en_progreso"
                const programadaISO = c.fechaProgramada
                  ? new Date(c.fechaProgramada).toISOString()
                  : null;
                const programadaYMD = programadaISO ? programadaISO.slice(0, 10) : null;
                const puedeTerminar = estadoCodigo === "en_progreso" && programadaYMD === hoyYMD;

                return (
                  <article
                    key={c.id}
                    className={`cm__card is-toned ${
                      estadoCodigo === "en_progreso"
                        ? "tone--progress"
                        : estadoCodigo === "terminada"
                        ? "tone--done"
                        : "tone--pending"
                    }`}
                    role="listitem"
                    data-reveal={String((idx % 5) + 1)}
                    aria-label={`Cita #${c.id} ${c.servicio?.nombre ?? ""}`}
                  >
                    <header className="cm__cardHeader">
                      <div className="cm__headline">
                        <span className="cm__id">#{c.id}</span>
                        <span className="cm__tipo">{c.servicio?.nombre ?? "Sin servicio"}</span>
                        {c.vehiculo?.placa && (
                          <span className="cm__placa">{c.vehiculo.placa}</span>
                        )}
                      </div>
                      <span
                        className={`cm__chip cm__chip--${
                          estadoCodigo || "sin_estado"
                        }`}
                      >
                        {(estadoCodigo || "sin_estado").replace("_", " ").toUpperCase()}
                      </span>
                    </header>

                    <div className="cm__meta">
                      <span className="cm__metaItem">
                        👤 {c.cliente?.nombreCompleto ?? "—"}
                      </span>
                      <span className="cm__metaItem">
                        🗓 {fmtSoloFecha(c.fechaProgramada)}
                      </span>
                    </div>

                    {c.comentario && <p className="cm__coment">{c.comentario}</p>}

                    <footer className="cm__actionsRow">
                      <button
                        className={puedeTerminar ? "btnPrimary" : "btnDisabled"}
                        disabled={!puedeTerminar}
                        onClick={() => onTerminar(c.id)}
                        title={
                          puedeTerminar
                            ? "Terminar cita"
                            : "Solo puede terminarse el día programado y cuando está en progreso"
                        }
                      >
                        TERMINAR
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
