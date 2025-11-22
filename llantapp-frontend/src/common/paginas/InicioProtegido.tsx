// llantapp-frontend/src/common/paginas/InicioProtegido.tsx
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import heroImg from "../../assets/img/inicio.png";
import "./estilos/inicioProtegido.css";

export default function InicioProtegido() {
  const { sesion, tieneRol } = useAuth();

  const rol = sesion?.perfil?.rol ?? "";
  const rolClase = rol ? `role-${rol.toLowerCase()}` : "";

  // 👇 Intentamos obtener el nombre del taller desde el perfil
  const tallerActual: string | null =
    // según cómo estés enviando el DTO desde el backend,
    // ajusta estos campos; están en modo "defensivo"
    ((sesion as any)?.perfil?.tallerNombre as string | undefined) ??
    ((sesion as any)?.perfil?.taller?.nombre as string | undefined) ??
    null;

  const esTaller = tieneRol(["ADMIN", "MECANICO"]);
  const tituloHero = esTaller
    ? "Gestiona tu taller desde un solo lugar"
    : "Gestiona tus vehículos desde un solo lugar";

  // Animación reveal robusta: visible por defecto y se aplica también a nodos insertados tras login
  useEffect(() => {
    const scope =
      document.querySelector<HTMLElement>(".inicio-container") ?? document;

    const applyReveal = (els: HTMLElement[]) => {
      els.forEach((el, i) => {
        if (el.classList.contains("animate-in")) return; // ya animada
        el.classList.add("will-animate");
        const delay = Number(el.dataset.delay ?? i * 80);
        const id = window.setTimeout(() => {
          el.classList.add("animate-in");
          // al terminar la transición, retiramos el flag de preparación
          const handler = () => el.classList.remove("will-animate");
          el.addEventListener("transitionend", handler, { once: true });
          el.addEventListener("animationend", handler, { once: true });
        }, delay);
        (el as any)._rid = id;
      });
    };

    // 1) Aplica a los reveals ya presentes
    applyReveal(Array.from(scope.querySelectorAll<HTMLElement>(".reveal")));

    // 2) Observa inserciones (cuando llegan tarjetas por rol)
    const mo = new MutationObserver((muts) => {
      const added: HTMLElement[] = [];
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches(".reveal")) added.push(n);
          added.push(
            ...Array.from(n.querySelectorAll<HTMLElement>(".reveal")),
          );
        });
      });
      if (added.length) applyReveal(added);
    });
    mo.observe(scope, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      scope.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        const rid = (el as any)._rid;
        if (rid) clearTimeout(rid);
        el.classList.remove("will-animate", "animate-in");
      });
    };
  }, [sesion?.perfil?.rol]); // se reprocesa cuando cambia el rol / llega sesión

  return (
    <div className="inicio-container">
      <section
        className="hero reveal"
        aria-labelledby="tit-hero"
        data-delay="0"
      >
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
                  <span className="user-emoji" aria-hidden>
                    🚗
                  </span>
                  <span className="user-name">
                    {sesion.perfil.nombreCompleto}
                  </span>

                  {/* 👇 Solo mostramos el taller si existe */}
                  {tallerActual && (
                    <>
                      <span className="separator">•</span>
                      <span className="taller-chip">
                        Taller: <strong>{tallerActual}</strong>
                      </span>
                    </>
                  )}

                  <span className="separator">•</span>
                  <span className={`role-chip ${rolClase}`} tabIndex={-1}>
                    {sesion.perfil.rol}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="hero-media" aria-hidden="true">
            <img
              className="hero-media__img"
              src={heroImg}
              alt=""
              loading="lazy"
            />
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
          {tieneRol(["CLIENTE"]) && (
            <Link
              to="/vehiculos/mios"
              className="btn-card btn-primary reveal"
              data-delay="160"
            >
              <div className="btn-icon">📋</div>
              <div className="btn-text">
                <div className="btn-title">Mis Vehículos</div>
                <div className="btn-sub">
                  Consulta el historial de tus unidades
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["MECANICO"]) && (
            <Link
              to="/vehiculos/registrar"
              className="btn-card btn-primary reveal"
              data-delay="120"
            >
              <div className="btn-icon">🚘</div>
              <div className="btn-text">
                <div className="btn-title">Registrar vehículo</div>
                <div className="btn-sub">
                  Alta rápida de unidades del taller
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["CLIENTE"]) && (
            <Link
              to="/citas/agendar"
              className="btn-card btn-accent reveal"
              data-delay="200"
            >
              <div className="btn-icon">📅</div>
              <div className="btn-text">
                <div className="btn-title">Agendar cita</div>
                <div className="btn-sub">Programa tu atención</div>
              </div>
            </Link>
          )}

          {tieneRol(["CLIENTE"]) && (
            <Link
              to="/citas/mias"
              className="btn-card btn-secondary reveal"
              data-delay="280"
            >
              <div className="btn-icon">🗂️</div>
              <div className="btn-text">
                <div className="btn-title">Mis citas</div>
                <div className="btn-sub">Consulta tus próximas visitas</div>
              </div>
            </Link>
          )}

          {tieneRol(["MECANICO"]) && (
            <Link
              to="/citas/asignadas"
              className="btn-card btn-secondary reveal"
              data-delay="360"
            >
              <div className="btn-icon">🛠️</div>
              <div className="btn-text">
                <div className="btn-title">Citas asignadas</div>
                <div className="btn-sub">Tareas del día</div>
              </div>
            </Link>
          )}

          {tieneRol(["CLIENTE", "MECANICO"]) && (
            <Link
              to="/notificaciones"
              className="btn-card btn-secondary reveal"
              data-delay="440"
            >
              <div className="btn-icon">🔔</div>
              <div className="btn-text">
                <div className="btn-title">Mis notificaciones</div>
                <div className="btn-sub">Alertas y recordatorios</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/servicios"
              className="btn-card btn-secondary reveal"
              data-delay="600"
            >
              <div className="btn-icon">📑</div>
              <div className="btn-text">
                <div className="btn-title">Catálogo de servicios</div>
                <div className="btn-sub">Gestiona oferta y disponibilidad</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/citas-pendientes"
              className="btn-card btn-secondary reveal"
              data-delay="680"
            >
              <div className="btn-icon">👷</div>
              <div className="btn-text">
                <div className="btn-title">Asignar mecánico</div>
                <div className="btn-sub">
                  Gestiona las citas nuevas y pendientes del taller
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/mantenimientos-vencidos"
              className="btn-card btn-secondary reveal"
              data-delay="700"
            >
              <div className="btn-icon">⏰</div>
              <div className="btn-text">
                <div className="btn-title">Mantenimientos vencidos</div>
                <div className="btn-sub">
                  Identifica vehículos con mantenimiento vencido
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/mantenimientos-vencidos"
              className="btn-card btn-secondary reveal"
              data-delay="700"
            >
              <div className="btn-icon">⏰</div>
              <div className="btn-text">
                <div className="btn-title">Mantenimientos vencidos</div>
                <div className="btn-sub">
                  Identifica vehículos con mantenimiento vencido
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/mantenimientos-vencidos"
              className="btn-card btn-secondary reveal"
              data-delay="700"
            >
              <div className="btn-icon">⏰</div>
              <div className="btn-text">
                <div className="btn-title">Mantenimientos vencidos</div>
                <div className="btn-sub">
                  Identifica vehículos con mantenimiento vencido
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/usuarios"
              className="btn-card btn-secondary reveal"
              data-delay="760"
            >
              <div className="btn-icon">👥</div>
              <div className="btn-text">
                <div className="btn-title">Usuarios del taller</div>
                <div className="btn-sub">Crea y gestiona usuarios</div>
              </div>
            </Link>
          )}

          {/* US-04 - Enviar promociones */}
          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/promociones"
              className="btn-card btn-highlight reveal"
              data-delay="800"
            >
              <div className="btn-icon">💌</div>
              <div className="btn-text">
                <div className="btn-title">Promociones</div>
                <div className="btn-sub">Envía ofertas a tus clientes</div>
              </div>
            </Link>
          )}

          {tieneRol(["CLIENTE"]) && (
            <Link
              to="/calificaciones/mias"
              className="btn-card btn-highlight reveal"
              data-delay="820"
            >
              <div className="btn-icon">⭐</div>
              <div className="btn-text">
                <div className="btn-title">Mis calificaciones</div>
                <div className="btn-sub">
                  Revisa o evalúa tus servicios
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["MECANICO"]) && (
            <Link
              to="/calificaciones/recibidas"
              className="btn-card btn-highlight reveal"
              data-delay="840"
            >
              <div className="btn-icon">🌟</div>
              <div className="btn-text">
                <div className="btn-title">Calificaciones recibidas</div>
                <div className="btn-sub">Opiniones de tus clientes</div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/calificaciones"
              className="btn-card btn-highlight reveal"
              data-delay="860"
            >
              <div className="btn-icon">📊</div>
              <div className="btn-text">
                <div className="btn-title">Revisar calificaciones</div>
                <div className="btn-sub">
                  Analiza desempeño y calidad del servicio
                </div>
              </div>
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
            <Link
              to="/admin/consumibles"
              className="btn-card btn-secondary reveal"
              data-delay="720"
            >
              <div className="btn-icon">🧴</div>
              <div className="btn-text">
                <div className="btn-title">Inventario de consumibles</div>
                <div className="btn-sub">
                  Gestiona stock de aceites, filtros y más
                </div>
              </div>
            </Link>
          )}

          {/* OWNER - Solicitudes de taller */}
          {tieneRol(["OWNER"] as any) && (
            <Link
              to="/owner/solicitudes-taller"
              className="btn-card btn-highlight reveal"
              data-delay="880"
            >
              <div className="btn-icon">🧾</div>
              <div className="btn-text">
                <div className="btn-title">Solicitudes de talleres</div>
                <div className="btn-sub">
                  Revisa y aprueba registros de nuevos talleres
                </div>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
