import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import heroImg from "../../assets/img/inicio.png";
import "../../estilos/inicioProtegido.css";

export default function InicioProtegido() {
  const { sesion, tieneRol } = useAuth();

  const rol = sesion?.perfil?.rol ?? "";
  const rolClase = rol ? `role-${rol.toLowerCase()}` : "";

  const esTaller = tieneRol(["ADMIN", "MECANICO"]);
  const tituloHero = esTaller
    ? "Gestiona tu taller desde un solo lugar"
    : "Gestiona tus vehículos desde un solo lugar";

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (nodes.length === 0) return;

    const timeouts: number[] = [];
    let destroyed = false;

    nodes.forEach((el) => el.classList.add("will-animate"));

    requestAnimationFrame(() => {
      nodes.forEach((el, i) => {
        const delay = Number(el.dataset.delay ?? i * 80);
        const id = window.setTimeout(() => {
          if (destroyed) return;
          el.classList.add("animate-in");
          const onEnd = () => el.classList.remove("will-animate");
          el.addEventListener("animationend", onEnd, { once: true });
        }, delay);
        timeouts.push(id);
      });
    });

    return () => {
      destroyed = true;
      timeouts.forEach(clearTimeout);
      nodes.forEach((el) => el.classList.remove("will-animate", "animate-in"));
    };
  }, []);

  return (
    <div className="inicio-container">
      <section className="hero reveal" aria-labelledby="tit-hero" data-delay="0">
        <div className="hero-bg" aria-hidden />
        <div className="hero-content">
          <div className="hero-left">
            <h1 id="tit-hero" className="hero-title hero-title--dark">
              {tituloHero}
            </h1>

            <p className="hero-sub">
              LlantApp te ayuda a registrar vehículos, agendar y seguir
              mantenimientos con una interfaz simple y profesional.
            </p>

            {sesion?.perfil && (
              <div className="user-row">
                <div className="user-pill" aria-label="usuario y rol">
                  <span className="user-emoji" aria-hidden>🚗</span>
                  <span className="user-name">{sesion.perfil.nombreCompleto}</span>
                  <span className="separator">•</span>
                  <span className={`role-chip ${rolClase}`} tabIndex={-1}>
                    {sesion.perfil.rol}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="hero-media" aria-hidden="true">
            <img className="hero-media__img" src={heroImg} alt="" loading="lazy" />
            <div className="hero-media__overlay" />
          </div>
        </div>
      </section>

      <main className="page">
        <header className="section-head reveal" data-delay="80">
          <h2>Comienza aquí</h2>
          <p>Atajos frecuentes según tu rol.</p>
        </header>

        <div className="acciones">
          {tieneRol(["MECANICO"]) && (
            <Link to="/vehiculos/registrar" className="btn-card btn-primary reveal" data-delay="120">
              <div className="btn-icon">🚘</div>
              <div className="btn-text">
                <div className="btn-title">Registrar vehículo</div>
                <div className="btn-sub">Alta rápida de unidades del taller</div>
              </div>
            </Link>
          )}

          {tieneRol(["CHOFER", "EMPRESA"]) && (
            <Link to="/citas/agendar" className="btn-card btn-accent reveal" data-delay="200">
              <div className="btn-icon">📅</div>
              <div className="btn-text">
                <div className="btn-title">Agendar cita</div>
                <div className="btn-sub">Programa tu atención</div>
              </div>
            </Link>
          )}

          {tieneRol(["CHOFER", "EMPRESA"]) && (
            <Link to="/citas/mias" className="btn-card btn-secondary reveal" data-delay="280">
              <div className="btn-icon">🗂️</div>
              <div className="btn-text">
                <div className="btn-title">Mis citas</div>
                <div className="btn-sub">Consulta tus próximas visitas</div>
              </div>
            </Link>
          )}

          {tieneRol(["MECANICO"]) && (
            <Link to="/citas/asignadas" className="btn-card btn-secondary reveal" data-delay="360">
              <div className="btn-icon">🛠️</div>
              <div className="btn-text">
                <div className="btn-title">Citas asignadas</div>
                <div className="btn-sub">Tareas del día</div>
              </div>
            </Link>
          )}

          {tieneRol(["CHOFER", "EMPRESA", "MECANICO"]) && (
            <Link to="/notificaciones" className="btn-card btn-secondary reveal" data-delay="440">
              <div className="btn-icon">🔔</div>
              <div className="btn-text">
                <div className="btn-title">Mis notificaciones</div>
                <div className="btn-sub">Alertas y recordatorios</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link to="/admin/citas-pendientes" className="btn-card btn-primary reveal" data-delay="520">
              <div className="btn-icon">📋</div>
              <div className="btn-text">
                <div className="btn-title">Citas pendientes</div>
                <div className="btn-sub">Gestión de agenda del taller</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link to="/admin/servicios" className="btn-card btn-secondary reveal" data-delay="600">
              <div className="btn-icon">📑</div>
              <div className="btn-text">
                <div className="btn-title">Catálogo de servicios</div>
                <div className="btn-sub">Gestiona oferta y disponibilidad</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link to="/admin/servicios/asociar" className="btn-card btn-secondary reveal" data-delay="680">
              <div className="btn-icon">👷</div>
              <div className="btn-text">
                <div className="btn-title">Asociar mecánico</div>
                <div className="btn-sub">Habilita personal para cada servicio</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link to="/admin/usuarios" className="btn-card btn-secondary reveal" data-delay="760">
              <div className="btn-icon">👥</div>
              <div className="btn-text">
                <div className="btn-title">Usuarios del taller</div>
                <div className="btn-sub">Crea y gestiona usuarios</div>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
