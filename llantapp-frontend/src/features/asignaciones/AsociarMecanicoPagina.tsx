import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiCitas } from "../mantenimientos/api";
import { apiUsuarios } from "./api";
import "./asociarMecanico.css";
import noResultadosImg from "../../assets/priv/cliente/no-resultados.png";

// Estado de cita
type EstadoCitaFE = "SOLICITADA" | "EN_PROGRESO" | "TERMINADA";

// Servicio como "tipo de mantenimiento"
interface ServicioLite {
  id: number;
  nombre: string;
}

interface CitaRow {
  id: number;
  estado: EstadoCitaFE;
  programadaPara?: string | null;

  // Opción A: Vehículo registrado
  vehiculo?: { placa: string } | null;

  // Opción B: Texto manual
  placaPreliminar?: string | null;

  clienteId: number;
  mecanicoId?: number | null;

  // Objeto mecánico (para leer nombre / ID)
  mecanico?: {
    id: number;
    nombreCompleto: string;
  } | null;

  // Servicio (tipo de mantenimiento real)
  servicioId?: number | null;
  servicio?: ServicioLite | null;
}

interface MecanicoRow {
  id: number;
  nombreCompleto: string;
}

export default function AdminCitasPendientes() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [mecanicos, setMecanicos] = useState<MecanicoRow[]>([]);
  // permitimos undefined en el valor (sin problema)
  const [seleccion, setSeleccion] = useState<Record<number, number | undefined>>({});
  const [q, setQ] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [cs, ms] = await Promise.all([
        apiCitas.pendientesAdmin(), // debe devolver servicio / servicioId / vehiculo / placaPreliminar
        apiUsuarios.listarPorRol("MECANICO"),
      ]);
      if (!alive) return;
      setCitas(cs);
      setMecanicos(ms);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Animaciones de entrada (reveal)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(
      () => nodes.forEach((n) => n.classList.add("will-animate")),
      0
    );
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          (e.target as HTMLElement).classList.toggle(
            "animate-in",
            e.isIntersecting
          )
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
  }, [citas.length]);

  const fmtFechaCorta = (s?: string | null) =>
    s
      ? new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" })
      : "—";

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();

    const activas = citas.filter((c) => c.estado !== "TERMINADA");
    if (!s) return activas;

    return activas.filter((c) => {
      const nombreServicio = (c.servicio?.nombre ?? "").toLowerCase();
      const placa = (c.vehiculo?.placa ?? c.placaPreliminar ?? "").toLowerCase();

      return (
        String(c.id).includes(s) ||
        nombreServicio.includes(s) ||
        placa.includes(s) ||
        c.estado.toLowerCase().includes(s)
      );
    });
  }, [q, citas]);

  const asignar = async (citaId: number) => {
    const mecIdSeleccionado = seleccion[citaId];
    const citaActual = citas.find((c) => c.id === citaId);

    // idFinal: garantizamos que sea un number
    const idFinal =
      mecIdSeleccionado ??
      citaActual?.mecanicoId ??
      citaActual?.mecanico?.id;

    if (!idFinal) {
      alert("Selecciona un mecánico");
      return;
    }

    setOkMsg(null);

    // 👇 aquí usamos SIEMPRE un number (idFinal), no number | undefined
    await apiCitas.asignar(citaId, idFinal);

    setCitas((prev) =>
      prev.map((cita) =>
        cita.id === citaId
          ? {
              ...cita,
              mecanicoId: idFinal,
              estado: "EN_PROGRESO",
            }
          : cita
      )
    );

    setOkMsg(`Cita #${citaId} asignada correctamente.`);
    setEditandoId(null);
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
          </div>
        </header>

        <form
          className="form reveal"
          data-reveal="2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="form-group form-group--full">
            <label className="label" htmlFor="buscar">
              Buscar
            </label>
            <div className="input-wrap">
              <input
                id="buscar"
                className="input"
                placeholder="Servicio, placa, estado o #ID…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </form>

        {filtradas.length === 0 ? (
          <div className="ams__box reveal" data-reveal="3" role="status">
            <div className="helper">
              No hay citas pendientes que coincidan con tu búsqueda.
            </div>
            <img
              src={noResultadosImg}
              alt="Sin resultados para tu búsqueda de citas pendientes"
              className="ams__emptyImg"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="ams__split reveal" data-reveal="3">
            {filtradas.map((c) => {
              const yaAsignada =
                c.mecanicoId != null || c.estado === "EN_PROGRESO";

              const esModoEdicion = editandoId === c.id;
              const bloqueado = yaAsignada && !esModoEdicion;
              const nombreServicio = c.servicio?.nombre ?? "Sin servicio";

              return (
                <article
                  key={c.id}
                  className="ams__box"
                  aria-label={`Cita #${c.id}`}
                >
                  <header className="box__meta">
                    <span className="pill">
                      <span className="pill__dot" />#{c.id}
                    </span>
                    <span className="pill">{nombreServicio}</span>
                    <span className="pill">
                      {c.estado.replace("_", " ")}
                    </span>
                  </header>

                  <div className="selList">
                    <div className="selRow">
                      <strong>Placa</strong>
                      <span>
                        {c.vehiculo?.placa || c.placaPreliminar || "—"}
                      </span>
                    </div>
                    <div className="selRow">
                      <strong>Fecha</strong>
                      <span>{fmtFechaCorta(c.programadaPara)}</span>
                    </div>
                  </div>

                  <div className="form form--one">
                    <div className="form-group">
                      <label className="label" htmlFor={`mec-${c.id}`}>
                        Mecánico
                      </label>
                      <div className="input-wrap">
                        <select
                          id={`mec-${c.id}`}
                          className="input"
                          disabled={bloqueado}
                          value={
                            seleccion[c.id] ??
                            c.mecanicoId ??
                            c.mecanico?.id ??
                            ""
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSeleccion((s) => ({
                              ...s,
                              [c.id]: val || undefined,
                            }));
                          }}
                        >
                          <option value="">Asignar…</option>
                          {mecanicos.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombreCompleto}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="actions" style={{ gap: "8px" }}>
                    {yaAsignada && !esModoEdicion && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: "#fff",
                          color: "#0f172a",
                          border: "1px solid #cbd5e1",
                          boxShadow: "none",
                        }}
                        onClick={() => setEditandoId(c.id)}
                      >
                        ✏️ Modificar
                      </button>
                    )}

                    {esModoEdicion && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #fecaca",
                          boxShadow: "none",
                          padding: "10px 14px",
                        }}
                        onClick={() => {
                          setEditandoId(null);
                          setSeleccion((s) => {
                            const copy = { ...s };
                            delete copy[c.id];
                            return copy;
                          });
                        }}
                        title="Cancelar cambios"
                      >
                        ✕
                      </button>
                    )}

                    {(!yaAsignada || esModoEdicion) && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => asignar(c.id)}
                        title={
                          esModoEdicion
                            ? "Guardar nuevo mecánico"
                            : "Asignar mecánico"
                        }
                      >
                        {esModoEdicion ? "💾 Guardar" : "🧰 Asignar"}
                      </button>
                    )}

                    {yaAsignada && !esModoEdicion && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#059669",
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginLeft: "4px",
                        }}
                      >
                        ✅ Asignado
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {okMsg && (
          <div className="success-message mt8" role="alert">
            {okMsg}
          </div>
        )}
      </section>
    </main>
  );
}
