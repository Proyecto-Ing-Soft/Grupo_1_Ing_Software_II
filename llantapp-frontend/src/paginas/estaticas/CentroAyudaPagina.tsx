import React, { useMemo, useState, useEffect, JSX } from "react";
import { Link } from "react-router-dom";
import HeaderPublico from "../inicio-publico/HeaderPublico";

import "../inicio-publico/css/inicioPublico.css";
import "./css/centroAyuda.css";
import llontoppSvg from "../../assets/public/landing/Llontopp.svg";
function CopiarCorreo({ correo }: { correo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(correo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      alert(`Copia este correo: ${correo}`);
    }
  }

  return (
    <button type="button" className="btn copy-btn" onClick={copiar}>
      {copiado ? "¡Copiado ✓!" : "Copiar correo"}
    </button>
  );
}

type Article = {
  id: string;
  title: string;
  keywords: string[];
  contentText: string;
  content: JSX.Element;
};

const ARTICLES: Article[] = [
  {
    id: "crear-cuenta-cliente",
    title: "Cómo crear mi cuenta cliente",
    keywords: ["registro", "signup", "cliente", "crear cuenta"],
    contentText:
      "Para crear tu cuenta cliente ingresa a Crear cuenta Cliente, completa tus datos básicos, verifica tu correo y ya podrás iniciar sesión. Si ya tienes cuenta, usa Iniciar sesión.",
    content: (
      <article id="crear-cuenta-cliente" className="help-article card">
        <h3>Cómo crear mi cuenta cliente</h3>
        <ol className="steps-list">
          <li>
            Ve a{" "}
            <Link className="textlink" to="/registro?rol=cliente">
              Crear cuenta (Cliente)
            </Link>
            .
          </li>
          <li>
            Completa <strong>nombres/apellidos</strong>,{" "}
            <strong>correo</strong> y <strong>contraseña</strong> segura.
          </li>
          <li>
            Revisa tu <strong>correo</strong> para confirmar (si tu
            configuración lo requiere). Luego vuelve a{" "}
            <Link className="textlink" to="/login?rol=cliente">
              Iniciar sesión (Cliente)
            </Link>
            .
          </li>
          <li>
            Al ingresar, verás tu panel y podrás <strong>registrar tu
            vehículo</strong> o solicitar servicios.
          </li>
        </ol>
        <div className="help-next-steps">
          <span className="kicker">Siguiente paso:</span>{" "}
          <a className="textlink" href="#registrar-vehiculo">
            Registrar vehículo
          </a>
        </div>
      </article>
    ),
  },
  {
    id: "registrar-vehiculo",
    title: "Cómo registrar mi vehículo",
    keywords: ["vehículo", "auto", "placa", "registro de vehículo"],
    contentText:
      "Para registrar tu vehículo entra al panel, busca la opción Registrar vehículo, completa la placa y datos básicos. Revisa que la placa tenga el formato correcto y que seas propietario válido.",
    content: (
      <article id="registrar-vehiculo" className="help-article card">
        <h3>Cómo registrar mi vehículo</h3>
        <ol className="steps-list">
          <li>
            Ingresa a tu cuenta de{" "}
            <Link className="textlink" to="/login?rol=cliente">
              Cliente
            </Link>
            .
          </li>
          <li>
            Desde el panel, elige <strong>Registrar vehículo</strong>.
          </li>
          <li>
            Completa <strong>placa</strong> (formato válido),{" "}
            <strong>marca/modelo</strong> y otros datos básicos.
          </li>
          <li>
            Guarda. Verás el vehículo en tu lista y podrás solicitar servicios.
          </li>
        </ol>
        <p className="muted">
          Si te aparece un mensaje de{" "}
          <em>“placa ya registrada”</em> o <em>“formato inválido”</em>, verifica
          tu placa y que seas el propietario del vehículo.
        </p>
        <div className="help-next-steps">
          <span className="kicker">Luego:</span>{" "}
          <a className="textlink" href="#estados-evidencias">
            Ver estados y evidencias
          </a>
        </div>
      </article>
    ),
  },
  {
    id: "estados-evidencias",
    title: "Cómo ver estados y evidencias",
    keywords: ["evidencias", "fotos", "videos", "seguimiento", "estado"],
    contentText:
      "Para ver estados y evidencias entra a Historial o a la sección Evidencias del servicio. Podrás revisar el estado, fotos y comentarios del taller durante el mantenimiento.",
    content: (
      <article id="estados-evidencias" className="help-article card">
        <h3>Cómo ver estados y evidencias</h3>
        <ol className="steps-list">
          <li>
            Ingresa a{" "}
            <Link className="textlink" to="/login?rol=cliente">
              tu cuenta
            </Link>{" "}
            y abre el <strong>Historial</strong> o el detalle del servicio.
          </li>
          <li>
            En <strong>Estados</strong> verás el avance. En{" "}
            <strong>Evidencias</strong> encontrarás fotos y notas del taller.
          </li>
          <li>
            Ante dudas, usa la opción <strong>Contactar</strong> del servicio o
            califica al finalizar.
          </li>
        </ol>
        <p className="muted">
          La evidencia visual ayuda a la transparencia: sabrás qué se hizo y
          cuándo.
        </p>
      </article>
    ),
  },
  {
    id: "onboarding-taller",
    title: "Cómo empezar como Taller",
    keywords: ["taller", "mecánico", "administrador", "onboarding", "llontopp"],
    contentText:
      "Accede como Taller, verifica tus asignaciones, actualiza estados y sube evidencias. Notificaciones integradas para mecánicos.",
    content: (
      <article id="onboarding-taller" className="help-article card">
        <h3>Cómo empezar como Administrador de un Taller</h3>
        <p>
          Esta guía resume las vistas y acciones clave del <strong>rol Taller</strong> (mecánicos y administradores).
        </p>
        <ol className="steps-list">
          <li>
            Ingresa a{" "}
            <Link className="textlink" to="/login?rol=taller">
              Iniciar sesión (Taller)
            </Link>
            .
          </li>
          <li>
            Si es tu primera vez, un administrador debe{" "}
            <a className="textlink" href="#gestionar-usuarios">
              crearte un usuario
            </a>{" "}
            y asignarte permisos.
          </li>
          <li>
            Revisa{" "}
            <a className="textlink" href="#asociar-mecanico">
              asignaciones
            </a>
            ,{" "}
            <a className="textlink" href="#actualizar-estado">
              estados
            </a>{" "}
            del mantenimiento y{" "}
            <a className="textlink" href="#subir-evidencias">
              evidencias visuales
            </a>
            .
          </li>
        </ol>
        <div className="llontopp-pill">
          <img src={llontoppSvg} alt="Llontopp" />
        </div>
      </article>
    ),
  },
  {
    id: "registrar-mantenimiento",
    title: "Registrar mantenimiento de vehículo (Taller)",
    keywords: ["mantenimiento", "registrar", "taller", "mecánico"],
    contentText:
      "Como mecánico, registra un mantenimiento asociándolo a un vehículo y especificando el detalle del trabajo realizado.",
    content: (
      <article id="registrar-mantenimiento" className="help-article card">
        <h3>Registrar mantenimiento de vehículo (Taller)</h3>
        <ol className="steps-list">
          <li>
            Ingresa como{" "}
            <Link className="textlink" to="/login?rol=taller">
              Taller
            </Link>{" "}
            y ve a tu panel.
          </li>
          <li>
            Elige <strong>Registrar mantenimiento</strong> y busca el{" "}
            <strong>vehículo/placa</strong>.
          </li>
          <li>
            Completa <strong>descripción</strong>, <strong>servicios</strong>{" "}
            realizados y <strong>fecha</strong>.
          </li>
          <li>Guarda para que quede en el historial del vehículo.</li>
        </ol>
        <div className="help-next-steps">
          <span className="kicker">Luego:</span>{" "}
          <a className="textlink" href="#actualizar-estado">
            Actualizar estado
          </a>{" "}
          y{" "}
          <a className="textlink" href="#subir-evidencias">
            subir evidencias
          </a>
          .
        </div>
      </article>
    ),
  },
  {
    id: "consultar-historial",
    title: "Consultar historial de servicios (Taller)",
    keywords: ["historial", "servicios", "taller", "vehículo"],
    contentText:
      "Busca un vehículo por placa y revisa su historial para conocer trabajos realizados y próximos.",
    content: (
      <article id="consultar-historial" className="help-article card">
        <h3>Consultar historial de servicios (Taller)</h3>
        <ol className="steps-list">
          <li>Desde el panel del Taller, abre <strong>Historial</strong>.</li>
          <li>
            Filtra por <strong>placa</strong> y selecciona el vehículo.
          </li>
          <li>
            Verás los <strong>mantenimientos</strong>, fechas, estados y{" "}
            <a className="textlink" href="#subir-evidencias">
              evidencias
            </a>
            .
          </li>
        </ol>
      </article>
    ),
  },
  {
    id: "actualizar-estado",
    title: "Actualizar estado de mantenimiento",
    keywords: ["estado", "programado", "en proceso", "terminado", "notificar"],
    contentText:
      "Cambia el estado del mantenimiento (programado, en proceso, terminado) para que el cliente reciba la notificación.",
    content: (
      <article id="actualizar-estado" className="help-article card">
        <h3>Actualizar estado de mantenimiento</h3>
        <ol className="steps-list">
          <li>Abre el mantenimiento desde tu listado.</li>
          <li>
            Cambia el <strong>estado</strong> a <em>Programado</em>,{" "}
            <em>En proceso</em> o <em>Terminado</em>.
          </li>
          <li>
            Guarda. El <strong>cliente</strong> será notificado del cambio.
          </li>
        </ol>
        <p className="muted">
          Si el cliente no recibe notificación, revisa su correo y número o
          reintenta el cambio de estado.
        </p>
      </article>
    ),
  },
  {
    id: "subir-evidencias",
    title: "Subir evidencias (fotos/videos)",
    keywords: ["evidencias", "fotos", "videos", "diagnóstico", "entrega"],
    contentText:
      "Adjunta fotos o videos del diagnóstico/entrega para dejar evidencia visual del trabajo realizado.",
    content: (
      <article id="subir-evidencias" className="help-article card">
        <h3>Subir evidencias (fotos/videos)</h3>
        <ol className="steps-list">
          <li>
            Ingresa al detalle del mantenimiento y ve a{" "}
            <strong>Evidencias</strong>.
          </li>
          <li>
            Sube <strong>imágenes</strong> o <strong>videos</strong> (formatos
            comunes, tamaño moderado).
          </li>
          <li>
            Añade una <strong>nota</strong> breve si es necesario (ej. “ruido en
            freno delantero”).
          </li>
        </ol>
        <p className="muted">
          Mantén las evidencias claras y con buena luz para favorecer la
          transparencia con el cliente.
        </p>
      </article>
    ),
  },
  {
    id: "gestionar-catalogo",
    title: "Gestionar catálogo de servicios",
    keywords: ["catálogo", "servicios", "administrador", "taller"],
    contentText:
      "Crea/edita servicios del catálogo y asigna qué mecánicos pueden realizarlos para organizar mejor el taller.",
    content: (
      <article id="gestionar-catalogo" className="help-article card">
        <h3>Gestionar catálogo de servicios</h3>
        <ol className="steps-list">
          <li>Accede con <strong>rol Administrador</strong>.</li>
          <li>
            Abre <strong>Catálogo de servicios</strong> y{" "}
            <strong>crea/edita</strong> entradas con su descripción.
          </li>
          <li>
            Asigna <strong>mecánicos</strong> habilitados para cada servicio.
          </li>
        </ol>
      </article>
    ),
  },
  {
    id: "notificar-asignacion",
    title: "Notificaciones de asignación (mecánico)",
    keywords: ["notificaciones", "asignación", "mecánico", "alertas"],
    contentText:
      "Cuando te asignen un mantenimiento, recibirás una alerta para atenderlo en la fecha indicada.",
    content: (
      <article id="notificar-asignacion" className="help-article card">
        <h3>Notificaciones de asignación (mecánico)</h3>
        <ol className="steps-list">
          <li>
            Revisa el centro de{" "}
            <Link className="textlink" to="/login?rol=taller">
              notificaciones (Taller)
            </Link>
            .
          </li>
          <li>
            Entra al mantenimiento asignado y valida la{" "}
            <strong>fecha/hora</strong>.
          </li>
          <li>
            Actualiza el <a className="textlink" href="#actualizar-estado">
              estado
            </a>{" "}
            y añade <a className="textlink" href="#subir-evidencias">evidencias</a> cuando corresponda.
          </li>
        </ol>
      </article>
    ),
  },
  {
    id: "asociar-mecanico",
    title: "Asociar mecánico al servicio (admin)",
    keywords: ["asignar", "mecánico", "servicio", "taller", "admin"],
    contentText:
      "Desde el dashboard administrativo, asigna un mecánico responsable para garantizar trazabilidad.",
    content: (
      <article id="asociar-mecanico" className="help-article card">
        <h3>Asociar mecánico al servicio (administrador)</h3>
        <ol className="steps-list">
          <li>Accede con <strong>rol Administrador</strong>.</li>
          <li>
            Abre <strong>Asignaciones</strong> y selecciona el{" "}
            <strong>servicio</strong>.
          </li>
          <li>
            Elige el <strong>mecánico responsable</strong> y guarda.
          </li>
        </ol>
        <p className="muted">
          El mecánico recibirá la{" "}
          <a className="textlink" href="#notificar-asignacion">
            notificación de asignación
          </a>
          .
        </p>
      </article>
    ),
  },
  {
    id: "gestionar-usuarios",
    title: "Gestionar usuarios del taller (admin)",
    keywords: ["usuarios", "taller", "administrador", "crear", "permisos"],
    contentText:
      "Crea, modifica y elimina usuarios administradores o mecánicos; asigna roles para controlar permisos.",
    content: (
      <article id="gestionar-usuarios" className="help-article card">
        <h3>Gestionar usuarios del taller (administrador)</h3>
        <ol className="steps-list">
          <li>Accede a <strong>Usuarios</strong> con rol Administrador.</li>
          <li>
            <strong>Crea</strong> usuarios, define su <strong>rol</strong> y
            datos básicos.
          </li>
          <li>
            <strong>Edita/Elimina</strong> usuarios cuando sea necesario.
          </li>
        </ol>
      </article>
    ),
  },
];

function useFilter(query: string) {
  const q = query.trim().toLowerCase();
  return useMemo(() => {
    if (!q) return ARTICLES;
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.toLowerCase().includes(q)) ||
        a.contentText.toLowerCase().includes(q)
    );
  }, [q]);
}

export default function CentroAyudaPagina() {
  const [query, setQuery] = useState("");
  const filtered = useFilter(query);

  // UX: al montar, ubica el foco en el input si vienes desde otra página
  useEffect(() => {
    const el = document.getElementById("help-search") as HTMLInputElement | null;
    el?.focus();
  }, []);

  return (
    <>
      {/* Topbar reutilizado de la landing */}
      <HeaderPublico />

      <main className="container help-main" style={{ paddingBottom: 32 }}>
        {/* MIGAS */}
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span aria-hidden>›</span>
          <span aria-current="page">Centro de ayuda</span>
        </nav>

        {/* HERO + BUSCADOR */}
        <section className="help-hero card surface-contrast">
          <div className="help-hero-copy">
            <p className="kicker">Centro de ayuda</p>
            <h1 className="section-title" style={{ margin: 0 }}>
              ¿En qué te ayudamos hoy?
            </h1>
            <p className="muted" style={{ marginTop: 6 }}>
              Encuentra guías rápidas para iniciar y dar seguimiento. Si buscas
              <span className="nowrap"> </span>
              <strong>FAQ</strong>, está en la landing:{" "}
              <a className="textlink" href="/#faq">
                /#faq
              </a>
              .
            </p>
            <div className="help-brand">
            <img src={llontoppSvg} alt="Llontopp" />
            </div>
          </div>

          <div className="help-search">
            <label htmlFor="help-search" className="sr-only">
              Buscar en el centro de ayuda
            </label>
            <input
              id="help-search"
              type="search"
              placeholder="Buscar artículos (ej. “registrar vehículo”)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-describedby="help-search-hint"
            />
            <small id="help-search-hint" className="muted">
              Escribe para filtrar las guías de esta página.
            </small>
          </div>
        </section>

        {/* TARJETAS DE CATEGORÍAS (accesos rápidos) */}
        <section className="help-grid">
          <a className="help-card tile" href="#crear-cuenta-cliente">
            <span className="badge">Empezar</span>
            <h4>Crear cuenta (Cliente)</h4>
            <p>Regístrate y accede a tu panel en minutos.</p>
          </a>

          <a className="help-card tile" href="#registrar-vehiculo">
            <span className="badge">Mi vehículo</span>
            <h4>Registrar vehículo</h4>
            <p>Añade placa y datos básicos para solicitar servicios.</p>
          </a>

          <a className="help-card tile" href="#estados-evidencias">
            <span className="badge">Seguimiento</span>
            <h4>Estados y evidencias</h4>
            <p>Revisa avances, fotos y notas del taller.</p>
          </a>

          <a className="help-card tile" href="#onboarding-taller">
            <span className="badge">Taller</span>
            <h4>Guías de Taller (Sprint 1)</h4>
            <p>Asignaciones, estados, evidencias y más.</p>
            </a>

            <a className="help-card tile" href="#subir-evidencias">
            <span className="badge">Taller</span>
            <h4>Subir evidencias</h4>
            <p>Fotos/videos del diagnóstico o entrega.</p>
            </a>

            <a className="help-card tile" href="#asociar-mecanico">
            <span className="badge">Admin</span>
            <h4>Asociar mecánico</h4>
            <p>Define responsables y mantén trazabilidad.</p>
            </a>

        </section>

        {/* RESULTADOS (cuando hay búsqueda) */}
        {query && (
          <section aria-live="polite" className="help-results">
            <h2 className="section-title" style={{ fontSize: 24 }}>
              Resultados
            </h2>
            {filtered.length === 0 ? (
              <p className="muted">No encontramos artículos para “{query}”.</p>
            ) : (
              <div className="results-list">
                {filtered.map((a) => (
                  <a key={a.id} className="result-item surface-contrast" href={`#${a.id}`}>
                    <h4>{a.title}</h4>
                    <p>{a.contentText}</p>
                    <span className="go">Ver guía</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* GUÍAS (contenido principal) */}
        <div className="help-body">
          <section className="help-articles">
            {!query && (
              <>
                <h2 className="section-title" style={{ fontSize: 24 }}>
                  Guías destacadas
                </h2>
                <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
                  Paso a paso para tus primeras acciones.
                </p>
              </>
            )}

            {/* Render de artículos filtrados o todo si no hay query */}
            {(query ? filtered : ARTICLES).map((a) => (
              <React.Fragment key={a.id}>{a.content}</React.Fragment>
            ))}
          </section>

          {/* ASIDE: contacto rápido */}
          <aside className="help-aside">
            <div className="card surface-contrast">
                <h4>¿Necesitas ayuda?</h4>
                <p className="muted">Si no encuentras lo que buscas, contáctanos.</p>

                <div className="contact-block">
                <a
                    className="btn btn-solid"
                    href="mailto:contacto.llantapp@gmail.com?subject=Soporte%20LlantApp%20-%20Centro%20de%20Ayuda&body=Hola%20equipo%20LlantApp,%20necesito%20ayuda%20con..."
                >
                    Escribir a soporte
                </a>
                <a className="btn phone-link" href="tel:+51915060423">
                    Llamar: +51 915 060 423
                </a>
                </div>

                <div className="divider" />

                <Link className="btn" to="/#contacto">
                Ver más opciones de contacto
                </Link>
            </div>
            </aside>

        </div>
      </main>
    </>
  );
}
