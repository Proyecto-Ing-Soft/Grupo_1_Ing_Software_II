import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../app/proveedorestado/AuthContext";
import "../estilos/inicioProtegido.css";
import BotonCerrarSesion from '../componentes/BotonCerrarSesion';

function RolBadge({ rol }: { rol?: string }) {
  const clase = useMemo(() => {
    switch ((rol ?? "").toUpperCase()) {
      case "ADMIN": return "rol-badge rol-admin";
      case "MECANICO": return "rol-badge rol-mecanico";
      case "ASISTENTE": return "rol-badge rol-asistente";
      case "CONDUCTOR":
      case "CHOFER": return "rol-badge rol-conductor";
      default: return "rol-badge rol-default";
    }
  }, [rol]);
  return <span className={clase}>{rol || "—"}</span>;
}

export default function InicioProtegido() {
  const { sesion, refrescar } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const doFetch = async () => {
          const r = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/yo`, {
            headers: { Authorization: `Bearer ${sesion.accessToken}` },
            credentials: "include",
          });
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        };

        let data;
        try {
          data = await doFetch();
        } catch (e: any) {
          if (e?.message === "401") {
            await refrescar();
            data = await doFetch();
          } else {
            throw e;
          }
        }

        if (mounted) setPerfil(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "No se pudo cargar tu perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sesion.accessToken, refrescar]);

  const fmt = (s?: string) =>
    s ? new Date(s).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <h1>Bienvenido 🚗</h1>
        <RolBadge rol={perfil?.rol} />
      </header>

      <section className="card" aria-live="polite">
        <h2>Tu perfil</h2>

        {loading && <p className="loading">Cargando…</p>}
        {error && !loading && <p className="error" role="alert">{error}</p>}

        {!loading && !error && perfil && (
          <div className="perfil-grid">
            <div className="perfil-item">
              <span className="label">Nombre</span>
              <span className="value">{perfil.nombreCompleto}</span>
            </div>
            <div className="perfil-item">
              <span className="label">Correo</span>
              <span className="value">{perfil.correo}</span>
            </div>
            <div className="perfil-item">
              <span className="label">Rol</span>
              <span className="value"><RolBadge rol={perfil.rol} /></span>
            </div>
            <div className="perfil-item">
              <span className="label">Creado</span>
              <span className="value">{fmt(perfil.creadoEn)}</span>
            </div>
          </div>
        )}

        <div className="acciones">
          <Link to="/vehiculos/registrar" className="btn-primary">Registrar vehículo</Link>
          <Link to="/citas/agendar" className="btn-primary" >Agendar cita</Link>
          <Link to="/notificaciones" className="btn-secondary">Mis notificaciones</Link>
        </div>
      </section>

      {!loading && perfil && (
        <details className="json-debug">
          <summary>Ver JSON completo</summary>
          <pre>{JSON.stringify(perfil, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
