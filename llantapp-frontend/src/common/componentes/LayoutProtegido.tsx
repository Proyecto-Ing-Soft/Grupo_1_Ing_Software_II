import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import BotonCerrarSesion from "./BotonCerrarSesion";
import "../estilos/LayoutProtegido.css";
import { useAuth } from "../../core/auth/AuthContext";
import { apiNotificacion } from "../../features/notificaciones/api";

export default function LayoutProtegido() {
  const { tieneRol } = useAuth();
  const [pendientes, setPendientes] = useState<number>(0);

  // Cargar notificaciones pendientes para la campanita
  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        const lista = await apiNotificacion.mias();
        if (!vivo) return;

        // Ajusta estos campos según tu DTO real de notificación
        const count = Array.isArray(lista)
          ? lista.filter(
              (n: any) =>
                n.estado === "PENDIENTE" ||
                n.leida === false ||
                n.leida === 0,
            ).length
          : 0;

        setPendientes(count);
      } catch (e) {
        if (!vivo) return;
        console.error("[LayoutProtegido] Error cargando notificaciones", e);
      }
    })();

    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="lp__wrap">
      <header className="lp__topbar">
        {/* Hacemos clickeable toda la marca */}
        <Link to="/inicio" className="lp__brand" aria-label="Ir al inicio">
          <span className="lp__logo">🚙</span>
          <span className="lp__title">LlantApp</span>
        </Link>

        <div className="lp__actions">
          {/* Campanita solo para ADMIN (puedes incluir otros roles si quieres) */}
          {tieneRol(["ADMIN"]) && (
            <Link
              to="/notificaciones"
              className="lp__notifBtn"
              aria-label="Ver notificaciones"
            >
              <span className="lp__notifIcon" aria-hidden="true">
                🔔
              </span>
              {pendientes > 0 && (
                <span className="lp__notifDot">
                  {pendientes > 9 ? "9+" : pendientes}
                </span>
              )}
            </Link>
          )}

          <BotonCerrarSesion className="logout-btn" />
        </div>
      </header>

      <main className="lp__main">
        <Outlet />
      </main>
    </div>
  );
}
