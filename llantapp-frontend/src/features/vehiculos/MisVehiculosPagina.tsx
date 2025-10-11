import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiVehiculos } from "./api";
import "./misVehiculos.css";
import noVehiculosImg from "../../assets/priv/cliente/no_vehiculos_registrados.png";

type VehiculoLite = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
};

export default function MisVehiculosPagina() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [vehiculos, setVehiculos] = useState<VehiculoLite[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!usuario?.token) return;
      try {
        setCargando(true);
        setError(null);
        const data = await apiVehiculos.mios(usuario.token);
        if (alive) setVehiculos(data);
      } catch (err: any) {
        if (alive) setError(err.message || "No se pudieron cargar los vehículos.");
      } finally {
        if (alive) setCargando(false);
      }
    })();
    return () => { alive = false; };
  }, [usuario?.token]);

  // Animaciones "reveal"
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e =>
        (e.target as HTMLElement).classList.toggle("animate-in", e.isIntersecting)
      ),
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => { n.dataset.reveal = String(Math.min(i + 1, 5)); obs.observe(n); });
    return () => { window.clearTimeout(t); nodes.forEach(n => obs.unobserve(n)); obs.disconnect(); };
  }, [cargando, vehiculos.length]);

  return (
    <main className="mv">
      <header className="mv__header mv__stack-lg">
        <div className="mv__titleWrap reveal" data-reveal="1">
          <h1 className="mv__title">Mis Vehículos</h1>
          <p className="mv__sub">Selecciona un vehículo para ver su historial de servicios.</p>
        </div>

        <div className="mv__toolbar reveal" data-reveal="2">
          <div className="mv__actions">
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
        </div>
      </header>

      {cargando && (
        <div className="mv__state reveal" data-reveal="2" role="status" aria-live="polite">
          Cargando tus vehículos…
        </div>
      )}

      {error && !cargando && (
        <div className="mv__state mv__state--error reveal" data-reveal="2" role="alert">
          Error: {error}
        </div>
      )}

      {!cargando && !error && (
        vehiculos.length === 0 ? (
          <div className="mv__empty reveal" data-reveal="3" role="status" aria-live="polite">
            <div className="mv__emptyInner mv__stack-md">
              <div className="mv__emptyEmoji" aria-hidden>🚘</div>
              <div className="mv__emptyTitle">No tienes vehículos registrados</div>
              <div className="mv__emptySub">Cuando registres uno, aparecerá aquí.</div>
              <img
                className="mv__emptyImg"
                src={noVehiculosImg}
                alt="Ilustración: no hay vehículos registrados"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="mv__grid reveal" data-reveal="3" role="list">
            {vehiculos.map((v, idx) => (
              <Link
                key={v.id}
                to={`/vehiculos/${v.id}/historial`}
                className="vehiculo-card"
                role="listitem"
                data-reveal={String((idx % 5) + 1)}
                title={`Ver historial de ${v.placa}`}
              >
                <div className="vehiculo-card__icon" aria-hidden>🚘</div>
                <div className="vehiculo-card__details">
                  <span className="vehiculo-card__placa">{v.placa}</span>
                  <span className="vehiculo-card__info">{v.marca} {v.modelo}</span>
                </div>
                <div className="vehiculo-card__cta">Ver historial →</div>
              </Link>
            ))}
          </div>
        )
      )}
    </main>
  );
}