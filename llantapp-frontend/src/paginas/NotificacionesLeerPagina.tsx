// src/paginas/NotificacionesTallerPagina.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../servicios/apiNotificacion";
import { useAuth } from "../app/proveedorestado/AuthContext";
import type { NotificacionDTO } from "../tipos/notificacion";
import { etiquetaTipo } from "../tipos/notificacion";
import "../estilos/notificaciones.css";

export default function NotificacionesTallerPagina() {
  const { usuario } = useAuth();
  const token = usuario?.token ?? "";
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>();
  const [items, setItems] = useState<NotificacionDTO[]>([]);

  const ordenadas = useMemo(() => {
    const p = { ALTA: 0, MEDIA: 1, BAJA: 2 } as const;
    return [...items].sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === "PENDIENTE" ? -1 : 1;
      if (a.prioridad !== b.prioridad) return p[a.prioridad] - p[b.prioridad];
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [items]);

  async function cargar() {
    try {
      setCargando(true);
      const data = await api.getMisNotificaciones<NotificacionDTO[]>(token);
      setItems(data);
      setError(undefined);
    } catch (e: any) {
      setError(e.message || "No se pudieron cargar las notificaciones");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (token) cargar();
  }, [token]);

  async function marcarLeidaOptimista(id: number) {
    const anterior = [...items];
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, estado: "LEIDA" } : n))
    );
    try {
      await api.marcarNotificacionLeida<{ ok: true }>(id, token);
    } catch (e: any) {
      setItems(anterior);
      setError(e.message || "No se pudo marcar como leída");
    }
  }

  // Urgente si faltan <= 3 días
  const esUrgente = (fechaLimite: string) => {
    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diffDias = Math.ceil(
      (limite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDias <= 3;
  };

  const fmtFecha = (s: string) =>
    new Date(s).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const fmtFechaCorta = (s: string) =>
    new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" });

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
          <p className="notif__subtitle">
            Alertas automáticas de mantenimiento y vencimiento de llantas
          </p>
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

      {error && !cargando && (
        <div className="state" role="alert">
          {error}
        </div>
      )}

      {!cargando && !error && ordenadas.length === 0 && (
        <div className="state" role="status">
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📋</div>
          <h3>Sin notificaciones</h3>
          <p>No tienes tareas asignadas en este momento.</p>
        </div>
      )}

      {!cargando && !error && ordenadas.length > 0 && (
        <section className="notif__grid">
          {ordenadas.map((n) => {
            const urgente = !!(n.fechaLimite && esUrgente(n.fechaLimite));
            return (
              <article
                key={n.id}
                className="notif__card"
                aria-live="polite"
                aria-label={`Notificación ${n.prioridad} - ${n.estado}`}
              >
                <div className="notif__cardHeader">
                  <div className="badges">
                    <span
                      className="badge badge--prioridad"
                      data-p={n.prioridad}
                      title={`Prioridad: ${n.prioridad}`}
                    >
                      {n.prioridad}
                    </span>
                    <span
                      className="badge badge--estado"
                      data-e={n.estado}
                      title={`Estado: ${n.estado}`}
                    >
                      {n.estado === "PENDIENTE" ? "Pendiente" : "Leída"}
                    </span>
                  </div>
                </div>

                <div className="notif__content">
                  <div className="notif__tipo">{etiquetaTipo[n.tipo]}</div>
                  <div className="notif__msg">{n.mensaje}</div>

                  <div className="notif__meta">
                    {n.vehiculoId && (
                      <span className="metaItem">
                        Vehículo ID:&nbsp;{n.vehiculoId}
                      </span>
                    )}
                    <span className="metaItem">
                      Creado:&nbsp;{fmtFechaCorta(n.creadoEn)}
                    </span>
                  </div>
                </div>

                <footer className="notif__footer">
                  <div className={`fecha ${urgente ? "fecha--urgente" : ""}`}>
                    {n.fechaLimite ? (
                      <>
                        <span aria-hidden>📅</span>
                        <span>{fmtFecha(n.fechaLimite)}</span>
                        {urgente && <span>&nbsp;⚠️ Urgente</span>}
                      </>
                    ) : (
                      <span>Sin fecha límite</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btnAction"
                    disabled={n.estado !== "PENDIENTE"}
                    onClick={() =>
                      n.estado === "PENDIENTE" && marcarLeidaOptimista(n.id)
                    }
                    aria-label={
                      n.estado === "PENDIENTE"
                        ? "Marcar como realizada"
                        : "Notificación ya realizada"
                    }
                    title={
                      n.estado === "PENDIENTE"
                        ? "Marcar como realizada"
                        : "Ya realizada"
                    }
                  >
                    ✅ {n.estado === "PENDIENTE" ? "Marcar como realizada" : "Realizada"}
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
