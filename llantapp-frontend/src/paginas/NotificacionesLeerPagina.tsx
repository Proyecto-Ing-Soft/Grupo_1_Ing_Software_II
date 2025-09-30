import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiNotificacion } from "../servicios/apiNotificacion";
import { useAuth } from "../app/proveedorestado/AuthContext";
import type { NotificacionDTO as _BaseDTO } from "../tipos/notificacion";
import "../estilos/notificaciones.css";

/**
 * Extensión no intrusiva del DTO:
 * permite usar campos opcionales que el backend puede enviar.
 */
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

  // 🎨 estado de cita -> clase tono
  const toneClass = (s?: string | null) =>
    s === "SOLICITADA"   ? "notif--solicitada" :
    s === "EN_PROGRESO"  ? "notif--progreso"  :
    s === "TERMINADA"    ? "notif--terminada" : "";

  const ordenadas = useMemo(() => {
    const p = { ALTA: 0, MEDIA: 1, BAJA: 2 } as const;
    return [...items].sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === "PENDIENTE" ? -1 : 1;
      if (a.prioridad !== b.prioridad) return p[a.prioridad] - p[b.prioridad];
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [items]);

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

  const fmtFechaCorta = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

  if (!usuario) {
    return (
      <div className="notif__container">
        <div className="state" role="alert">
          Debes iniciar sesión para ver tus notificaciones.
        </div>
      </div>
    );
  }

  return (
    <div className="notif__container">
      <header className="notif__header">
        <div>
          <h1 className="notif__title">Mis notificaciones</h1>
          <p className="notif__subtitle">Cambios en tus citas de mantenimiento</p>
        </div>
        <button
          type="button"
          className="notif__refresh"
          onClick={cargar}
          aria-label="Actualizar notificaciones"
          title="Actualizar"
        >
          🔄 Actualizar
        </button>
      </header>

      {cargando && (
        <div className="state state--loading" aria-busy="true">
          Cargando notificaciones…
        </div>
      )}

      {error && !cargando && <div className="state" role="alert">{error}</div>}

      {!cargando && !error && ordenadas.length === 0 && (
        <div className="state" role="status">
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📋</div>
          <h3>Sin notificaciones</h3>
          <p>No tienes cambios de cita por ahora.</p>
        </div>
      )}

      {!cargando && !error && ordenadas.length > 0 && (
        <section className="notif__grid">
          {ordenadas.map((n) => {
            // Si el backend aún no manda citaEstado, lo inferimos por texto
            const inferirEstado = (): "SOLICITADA"|"EN_PROGRESO"|"TERMINADA"|undefined => {
              const txt = `${n.titulo ?? ""} ${n.mensaje ?? ""}`.toLowerCase();
              if (/(completad|finalizad)/.test(txt)) return "TERMINADA";
              if (/(proceso|asignad)/.test(txt))     return "EN_PROGRESO";
              if (/(registrad|solicitud)/.test(txt)) return "SOLICITADA";
              return undefined;
            };
            const estadoCita = n.citaEstado ?? inferirEstado();

            // 👷 Acciones especiales para MECÁNICO en EN_PROGRESO
            const mostrarAccionesMecanico = isMecanico && estadoCita === "EN_PROGRESO" && !!n.citaId;

            // Mensaje amigable para mecánico
            const mensajeMecanico =
              mostrarAccionesMecanico
                ? `Se te asignó la cita #${n.citaId}. Confirma los datos del vehículo.`
                : null;

            return (
              <article
                key={n.id}
                className={`notif__card is-toned ${toneClass(estadoCita)}`}
                data-cita={estadoCita ?? undefined}
                aria-live="polite"
                aria-label={`Notificación ${n.prioridad ?? ''} - ${n.estado}`}
              >
                <div className="notif__cardHeader">
                  <div className="badges">
                    {estadoCita && (
                      <span className="badge badge--cita" title={`Cita: ${estadoCita}`}>
                        {estadoCita.replace("_"," ")}
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

                <div className="notif__content">
                  {/* Título si llega */}
                  {n.titulo && <div className="notif__tipo">{n.titulo}</div>}

                  {/* Mensaje: usa el especial de mecánico si aplica */}
                  <div className="notif__msg">
                    {mensajeMecanico ?? n.mensaje}
                  </div>

                  <div className="notif__meta">
                    {n.placa && <span className="metaItem">Placa:&nbsp;{n.placa}</span>}
                    {n.citaFecha && <span className="metaItem">Fecha:&nbsp;{fmtFechaCorta(n.citaFecha)}</span>}
                    <span className="metaItem">Creado:&nbsp;{fmtFechaCorta(n.creadoEn)}</span>
                  </div>
                </div>

                <footer className="notif__footer">
                  {mostrarAccionesMecanico ? (
                    <div className="flex gap-2" style={{ display: "flex", gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btnBrand"
                        onClick={() => navigate(`/vehiculos/registrar?cita=${n.citaId}`, { state: { citaId: n.citaId } })}
                        title="Confirmar datos preliminares / Registrar vehículo"
                      >
                        🚗 Confirmar datos preliminares
                      </button>
                      <button
                        type="button"
                        className="btnAction"
                        onClick={() => navigate(`/mantenimientos/registrar?cita=${n.citaId}`, { state: { citaId: n.citaId } })}
                        title="Registrar mantenimiento"
                      >
                        🛠️ Registrar mantenimiento
                      </button>
                      {/* Opcional: aún puedes marcar como leída */}
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
                      className="btnAction"
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
        </section>
      )}
    </div>
  );
}
