// src/paginas/AdminCitasPendientes.tsx
// UI estilo "Mis notificaciones" (cards + toolbar + reveal). Lógica intacta.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCitas } from "../servicios/apiCitas";
import { apiUsuarios } from "../servicios/apiUsuarios";
import "../estilos/adminCitas.css";

// Tipos mínimos para esta vista
type TipoMantenimientoFE = "PREVENTIVO" | "CORRECTIVO" | "LEGAL_ITV" | "EXTRAS";
type EstadoCitaFE = "SOLICITADA" | "EN_PROGRESO" | "TERMINADA";

interface CitaRow {
  id: number;
  tipo: TipoMantenimientoFE;
  estado: EstadoCitaFE;
  programadaPara?: string | null; // ISO string
  vehiculo?: { placa: string } | null;
  clienteId: number;
  mecanicoId?: number | null;
}
interface MecanicoRow {
  id: number;
  nombreCompleto: string;
}

export default function AdminCitasPendientes() {
  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [mecanicos, setMecanicos] = useState<MecanicoRow[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  // Carga inicial (misma lógica)
  useEffect(() => {
    apiCitas.pendientesAdmin().then(setCitas);
    apiUsuarios.listarPorRol("MECANICO").then(setMecanicos);
  }, []);

  // Reveal animations (solo UI)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add("animate-in");
          else (e.target as HTMLElement).classList.remove("animate-in");
        }
      },
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => {
      n.dataset.reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });
    return () => {
      window.clearTimeout(t);
      nodes.forEach(n => obs.unobserve(n));
      obs.disconnect();
    };
  }, [citas.length]);

  const asignar = async (citaId: number) => {
    const mecId = seleccion[citaId];
    if (!mecId) return alert("Selecciona un mecánico");
    await apiCitas.asignar(citaId, mecId);
    setCitas(prev => prev.filter(c => c.id !== citaId)); // refresco optimista
  };

  const fmtFechaCorta = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

  const toneClass =
    (tipo?: string) =>
      tipo === "PREVENTIVO" ? "acp--prev" :
      tipo === "CORRECTIVO" ? "acp--corr" :
      tipo === "LEGAL_ITV"  ? "acp--legal" :
      tipo === "EXTRAS"     ? "acp--extra" : "";

  return (
    <main className="acp">
      <header className="acp__header acp__stack-lg">
        <div className="acp__titleWrap reveal" data-reveal="1">
          <h1 className="acp__title">Citas pendientes</h1>
          <p className="acp__sub">Asigna un mecánico a cada solicitud de mantenimiento.</p>
        </div>

        <div className="acp__toolbar reveal" data-reveal="2">
          <div className="acp__actions">
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

      {/* Empty state elegante si no hay citas */}
      {citas.length === 0 ? (
        <section className="acp__content acp__stack-xl">
          <div className="acp__empty reveal" data-reveal="3" role="status" aria-live="polite">
            <div className="acp__emptyInner acp__stack-md">
              <div className="acp__emptyEmoji" aria-hidden>📭</div>
              <div className="acp__emptyTitle">No hay citas pendientes</div>
              <div className="acp__emptySub">Vuelve más tarde o revisa el historial.</div>
            </div>
          </div>
        </section>
      ) : (
        <section className="acp__content">
          {/* Grid de tarjetas (reemplaza a la tabla; misma información y acciones) */}
          <div className="acp__grid reveal" data-reveal="3" role="list">
            {citas.map((c, idx) => (
              <article
                key={c.id}
                role="listitem"
                className={`acp__card is-toned ${toneClass(c.tipo)}`}
                data-reveal={String((idx % 5) + 1)}
                aria-label={`Cita #${c.id} ${c.tipo}`}
              >
                <header className="acp__cardHeader">
                  <div className="badges">
                    <span className="badge badge--id">#{c.id}</span>
                    <span className="badge badge--tipo">{c.tipo.replace("_", " ")}</span>
                    <span className="badge badge--estado" data-e={c.estado}>
                      {c.estado.replace("_", " ")}
                    </span>
                  </div>
                </header>

                <div className="acp__body">
                  <div className="acp__row">
                    <span className="metaKey">Placa</span>
                    <span className="metaVal">{c.vehiculo?.placa ?? "—"}</span>
                  </div>
                  <div className="acp__row">
                    <span className="metaKey">Fecha</span>
                    <span className="metaVal">{fmtFechaCorta(c.programadaPara)}</span>
                  </div>

                  <div className="acp__assign">
                    <label className="label" htmlFor={`mec-${c.id}`}>Mecánico</label>
                    <div className="input-wrap">
                      <select
                        id={`mec-${c.id}`}
                        className="input"
                        value={seleccion[c.id] ?? ""}
                        onChange={e =>
                          setSeleccion(s => ({ ...s, [c.id]: Number(e.target.value) }))
                        }
                      >
                        <option value="">Asignar…</option>
                        {mecanicos.map(m => (
                          <option key={m.id} value={m.id}>{m.nombreCompleto}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <footer className="acp__cardFooter">
                  <button
                    type="button"
                    className="mc-btn mc-btn--gradient"
                    onClick={() => asignar(c.id)}
                    title="Asignar mecánico"
                  >
                    <span className="mc-icon" aria-hidden>🧰</span>
                    <span className="mc-btn__text">Asignar</span>
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
