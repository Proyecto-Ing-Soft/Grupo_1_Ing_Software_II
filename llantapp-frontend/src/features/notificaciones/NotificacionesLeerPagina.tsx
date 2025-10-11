import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiNotificacion } from "./api";
import { useAuth } from "../../core/auth/AuthContext";
import type { NotificacionDTO as _BaseDTO } from "./tipos";
import "./notificaciones.css";

type NotificacionDTO = _BaseDTO & {
  titulo?: string;
  citaEstado?: "SOLICITADA" | "EN_PROGRESO" | "TERMINADA" | string | null;
  placa?: string | null;
  citaFecha?: string | null;
};

export default function NotificacionesLeerPagina() {
  const { sesion, usuario } = useAuth();
  const accessToken = sesion?.accessToken ?? "";
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>();
  const [items, setItems] = useState<NotificacionDTO[]>([]);
  const navigate = useNavigate();

  const isMecanico = usuario?.rol === "MECANICO";
  const isCliente  = usuario?.rol === "CLIENTE"; // 👈 NUEVO

  const toneClass = (s?: string | null) =>
    s === "SOLICITADA"   ? "notif--solicitada" :
    s === "EN_PROGRESO"  ? "notif--progreso"  :
    s === "TERMINADA"    ? "notif--terminada" : "";

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await apiNotificacion.mias(accessToken);
      setItems(data as NotificacionDTO[]);
      setError(undefined);
    } catch (e: any) {
      setError(e.message || "No se pudieron cargar las notificaciones");
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => { if (accessToken) cargar(); }, [accessToken]);

  const ordenadas = useMemo(() => {
    const p = { ALTA: 0, MEDIA: 1, BAJA: 2 } as const;
    return [...items].sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === "PENDIENTE" ? -1 : 1;
      if (a.prioridad !== b.prioridad) return p[a.prioridad] - p[b.prioridad];
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [items]);

  const marcarLeidaOptimista = async (id: number) => {
    const anterior = [...items];
    setItems(prev => prev.map(n => (n.id === id ? { ...n, estado: "LEIDA" } : n)));
    try {
      await apiNotificacion.marcarLeida(id, accessToken);
    } catch (e: any) {
      setItems(anterior);
      setError(e.message || "No se pudo marcar como leída");
    }
  };

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
  }, [cargando, ordenadas.length]);

  const fmtFechaCorta = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

  if (!usuario) {
    return (
      <main className="ntf">
        <div className="ntf__state ntf__state--error" role="alert">
          Debes iniciar sesión para ver tus notificaciones.
        </div>
      </main>
    );
  }

  return (
    <main className="ntf">
      <header className="ntf__header ntf__stack-lg">
        <div className="ntf__titleWrap reveal" data-reveal="1">
          <h1 className="ntf__title">Mis notificaciones</h1>
          <p className="ntf__sub">Cambios en tus citas de mantenimiento</p>
        </div>

        <div className="ntf__toolbar reveal" data-reveal="2">
          <div className="ntf__actions">
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
        <div className="ntf__state ntf__state--loading reveal" data-reveal="2" aria-busy="true">
          Cargando notificaciones…
        </div>
      )}
      {error && !cargando && (
        <div className="ntf__state ntf__state--error reveal" data-reveal="2" role="alert">
          {error}
        </div>
      )}

      {!cargando && !error && (
        <section className="ntf__content ntf__stack-xl">
          {ordenadas.length === 0 ? (
            <>
              <div className="ntf__empty reveal" data-reveal="3" role="status" aria-live="polite">
                <div className="ntf__emptyInner ntf__stack-md">
                  <div className="ntf__emptyEmoji" aria-hidden>📋</div>
                  <div className="ntf__emptyTitle">Sin notificaciones</div>
                  <div className="ntf__emptySub">No tienes cambios de cita por ahora.</div>
                </div>
              </div>

              <div className="ntf__ctaRow reveal" data-reveal="4">
                <button
                  type="button"
                  className="mc-btn mc-btn--gradient"
                  onClick={cargar}
                  title="Actualizar notificaciones"
                >
                  <span className="mc-icon" aria-hidden>🔄</span>
                  <span className="mc-btn__text">Actualizar</span>
                </button>
              </div>
            </>
          ) : (
            <div className="ntf__grid reveal" data-reveal="3" role="list">
              {ordenadas.map((n, idx) => {
                const inferirEstado = (): "SOLICITADA"|"EN_PROGRESO"|"TERMINADA"|undefined => {
                  const txt = `${n.titulo ?? ""} ${n.mensaje ?? ""}`.toLowerCase();
                  if (/(completad|finalizad)/.test(txt)) return "TERMINADA";
                  if (/(proceso|asignad)/.test(txt))     return "EN_PROGRESO";
                  if (/(registrad|solicitud)/.test(txt)) return "SOLICITADA";
                  return undefined;
                };
                const estadoCita = n.citaEstado ?? inferirEstado();
                const mostrarAccionesMecanico = isMecanico && estadoCita === "EN_PROGRESO" && !!n.citaId;

                // 👇 NUEVO: botón calificar para CLIENTE si la cita está TERMINADA y hay citaId
                const mostrarAccionesCliente = isCliente && estadoCita === "TERMINADA" && !!n.citaId;

                const mensajeMecanico =
                  mostrarAccionesMecanico
                    ? `Se te asignó la cita #${n.citaId}. Confirma los datos del vehículo.`
                    : null;

                return (
                  <article
                    key={n.id}
                    role="listitem"
                    className={`ntf__card is-toned ${toneClass(estadoCita)}`}
                    data-reveal={String((idx % 5) + 1)}
                    aria-live="polite"
                    aria-label={`Notificación ${n.prioridad ?? ''} - ${n.estado}`}
                  >
                    <div className="ntf__cardHeader">
                      <div className="badges">
                        {estadoCita && (
                          <span className="badge badge--cita" title={`Cita: ${estadoCita}`}>
                            {String(estadoCita).replace("_"," ")}
                          </span>
                        )}
                        <span className="badge badge--estado" data-e={n.estado} title={`Notificación: ${n.estado}`}>
                          {n.estado === "PENDIENTE" ? "Pendiente" : "Leída"}
                        </span>
                        {n.prioridad && (
                          <span className="badge badge--prioridad" data-p={n.prioridad} title={`Prioridad: ${n.prioridad}`}>
                            {n.prioridad}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ntf__content">
                      {n.titulo && <div className="ntf__tipo">{n.titulo}</div>}
                      <div className="ntf__msg">{mensajeMecanico ?? n.mensaje}</div>

                      <div className="ntf__meta">
                        {n.placa && <span className="metaItem">Placa:&nbsp;{n.placa}</span>}
                        {n.citaFecha && <span className="metaItem">Fecha:&nbsp;{fmtFechaCorta(n.citaFecha)}</span>}
                        <span className="metaItem">Creado:&nbsp;{fmtFechaCorta(n.creadoEn)}</span>
                      </div>
                    </div>

                    <footer className="ntf__footer">
                      {mostrarAccionesMecanico ? (
                        <div className="btnRow">
                          <button
                            type="button"
                            className="mc-btn mc-btn--gradient"
                            onClick={() => navigate(`/vehiculos/registrar?cita=${n.citaId}`, { state: { citaId: n.citaId } })}
                            title="Confirmar datos preliminares / Registrar vehículo"
                          >
                            <span className="mc-icon" aria-hidden>🚗</span>
                            <span className="mc-btn__text">Confirmar datos</span>
                          </button>

                          <button
                            type="button"
                            className="mc-btn mc-btn--gradient"
                            onClick={() =>
                              navigate(`/mantenimientos/registrar?cita=${n.citaId}`, {
                                state: { citaId: n.citaId },
                              })
                            }
                            title="Registrar mantenimiento de esta cita"
                          >
                            <span className="mc-icon" aria-hidden>🛠️</span>
                            <span className="mc-btn__text">Registrar mantenimiento</span>
                          </button>

                          {n.estado === "PENDIENTE" && (
                            <button
                              type="button"
                              className="btnGhost"
                              onClick={() => marcarLeidaOptimista(n.id)}
                              title="Marcar como leída"
                            >
                              ✅ Marcar como leída
                            </button>
                          )}
                        </div>
                      ) : mostrarAccionesCliente ? (
                        <div className="btnRow">
                          <button
                            type="button"
                            className="mc-btn mc-btn--gradient"
                            onClick={() => navigate(`/calificaciones/cita/${n.citaId}`)}
                            title="Calificar este servicio"
                          >
                            <span className="mc-icon" aria-hidden>⭐</span>
                            <span className="mc-btn__text">Calificar servicio</span>
                          </button>

                          {n.estado === "PENDIENTE" && (
                            <button
                              type="button"
                              className="btnGhost"
                              onClick={() => marcarLeidaOptimista(n.id)}
                              title="Marcar como leída"
                            >
                              ✅ Marcar como leída
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btnActionDark"
                          disabled={n.estado !== "PENDIENTE"}
                          onClick={() => n.estado === "PENDIENTE" && marcarLeidaOptimista(n.id)}
                          aria-label={n.estado === "PENDIENTE" ? "Marcar como leída" : "Notificación ya leída"}
                          title={n.estado === "PENDIENTE" ? "Marcar como leída" : "Ya leída"}
                        >
                          ✅ {n.estado === "PENDIENTE" ? "Marcar como leída" : "Leída"}
                        </button>
                      )}
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
