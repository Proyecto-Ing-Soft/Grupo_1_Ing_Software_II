
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiCitas } from "../citas/api";
import { apiUsuarios } from "./api";
import "./asociarMecanico.css";
import noResultadosImg from "../../assets/priv/cliente/no-resultados.png";

type TipoMantenimientoFE = "PREVENTIVO" | "CORRECTIVO" | "LEGAL_ITV" | "EXTRAS";
type EstadoCitaFE = "SOLICITADA" | "EN_PROGRESO" | "TERMINADA";

interface CitaRow {
  id: number;
  tipo: TipoMantenimientoFE;
  estado: EstadoCitaFE;
  programadaPara?: string | null;
  vehiculo?: { placa: string } | null;
  clienteId: number;
  mecanicoId?: number | null;
}
interface MecanicoRow {
  id: number;
  nombreCompleto: string;
}

export default function AdminCitasPendientes() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [mecanicos, setMecanicos] = useState<MecanicoRow[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const [q, setQ] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [cs, ms] = await Promise.all([
        apiCitas.pendientesAdmin(),
        apiUsuarios.listarPorRol("MECANICO"),
      ]);
      if (!alive) return;
      setCitas(cs);
      setMecanicos(ms);
    })();
    return () => { alive = false; };
  }, []);

  // Animaciones de entrada (reveal)
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
  }, [citas.length]);

  const fmtFechaCorta = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return citas;
    return citas.filter(c =>
      String(c.id).includes(s) ||
      c.tipo.toLowerCase().includes(s) ||
      (c.vehiculo?.placa ?? "").toLowerCase().includes(s) ||
      c.estado.toLowerCase().includes(s)
    );
  }, [q, citas]);

  const asignar = async (citaId: number) => {
    const mecId = seleccion[citaId];
    if (!mecId) return alert("Selecciona un mecánico");
    setOkMsg(null);
    await apiCitas.asignar(citaId, mecId);
    setCitas(prev => prev.filter(c => c.id !== citaId));
    setOkMsg(`Cita #${citaId} asignada correctamente.`);
  };

  return (
    <main className="ams ams-scope">
      <section className="agendar__left reveal" data-reveal="1">
        <header className="ams__head">
          <h1 className="agendar__title">Citas pendientes</h1>
          <p className="agendar__sub">
            Asigna un mecánico a cada solicitud de mantenimiento.
          </p>
          <div className="ams__toolbar">
            {/* Botón igual al de Admin Calificaciones */}
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
        </header>

        <form className="form reveal" data-reveal="2" onSubmit={e => e.preventDefault()}>
          <div className="form-group form-group--full">
            <label className="label" htmlFor="buscar">Buscar</label>
            <div className="input-wrap">
              <input
                id="buscar"
                className="input"
                placeholder="Placa, tipo, estado o #ID…"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
          </div>
        </form>

        {filtradas.length === 0 ? (
          <div className="ams__box reveal" data-reveal="3" role="status">
            <div className="helper">No hay citas pendientes que coincidan con tu búsqueda.</div>
            <img
              src={noResultadosImg}
              alt="Sin resultados para tu búsqueda de citas pendientes"
              className="ams__emptyImg"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="ams__split reveal" data-reveal="3">
            {filtradas.map(c => (
              <article key={c.id} className="ams__box" aria-label={`Cita #${c.id}`}>
                <header className="box__meta">
                  <span className="pill"><span className="pill__dot" />#{c.id}</span>
                  <span className="pill">{c.tipo.replace("_", " ")}</span>
                  <span className="pill">{c.estado.replace("_", " ")}</span>
                </header>

                <div className="selList">
                  <div className="selRow"><strong>Placa</strong><span>{c.vehiculo?.placa ?? "—"}</span></div>
                  <div className="selRow"><strong>Fecha</strong><span>{fmtFechaCorta(c.programadaPara)}</span></div>
                </div>

                <div className="form form--one">
                  <div className="form-group">
                    <label className="label" htmlFor={`mec-${c.id}`}>Mecánico</label>
                    <div className="input-wrap">
                      <select
                        id={`mec-${c.id}`}
                        className="input"
                        value={seleccion[c.id] ?? ""}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setSeleccion(s => ({ ...s, [c.id]: (val || undefined) as any }));
                        }}
                      >
                        <option value="">Asignar…</option>
                        {mecanicos.map(m => (<option key={m.id} value={m.id}>{m.nombreCompleto}</option>))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => asignar(c.id)}
                    title="Asignar mecánico a la cita"
                  >
                    🧰 Asignar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {okMsg && <div className="success-message mt8" role="alert">{okMsg}</div>}
      </section>
    </main>
  );
}
