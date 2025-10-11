import React from "react";
import TabsRolAuth from "./TabsRolAuth";

export default function Hero(){

  const [indiceSlide, setIndiceSlide] = React.useState(0);

  const slides = React.useMemo(() => ([
    {
      rol: "Cliente",
      bullets: [
        "Consulta el historial de servicios por vehículo.",
        "Recibe recordatorios y alertas de mantenimiento.",
        "Califica el servicio al finalizar."
      ] // US-02, US-03/US-10, US-16
    },
    {
      rol: "Taller",
      bullets: [
        "Registra vehículos y mantenimientos con evidencias visuales.",
        "Asocia técnicos y notifica tareas asignadas.",
        "Controla estado de llantas y genera avisos automáticos."
      ] // US-00/US-01/US-05, US-15/US-08, US-06/US-03
    }
  ]), []);

  React.useEffect(() => {
    const id = setInterval(() => setIndiceSlide((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="container hero-2col" aria-label="Presentación">
      <article className="hero-card">
        <h2 style={{fontSize:"clamp(22px,3.2vw,36px)", lineHeight:1.1, marginBottom:8}}>
          Transparencia técnica. <br />Control real.
        </h2>
        <p className="hero-sub">
          Historial, evidencias y avisos automáticos en un solo lugar.
        </p>

        <div className="hero-pills" role="tablist" aria-label="Roles">
          <button
            type="button"
            className={`pill ${indiceSlide === 0 ? "active" : ""}`}
            aria-selected={indiceSlide === 0}
            onClick={() => setIndiceSlide(0)}
            title="Ver características para Cliente"
          >
            Cliente
          </button>
          <button
            type="button"
            className={`pill ${indiceSlide === 1 ? "active" : ""}`}
            aria-selected={indiceSlide === 1}
            onClick={() => setIndiceSlide(1)}
            title="Ver características para Taller"
          >
            Taller
          </button>
        </div>

        <ul
          className="hero-bullets"
          aria-live="polite"
          aria-label={`Características para ${slides[indiceSlide].rol} (Sprint 1)`}
        >
          {slides[indiceSlide].bullets.map((texto, i) => (
            <li key={i}>
              <span className="dot" /> {texto}
            </li>
          ))}
        </ul>
        <p className="hero-note">Tus datos se protegen según nuestras políticas de privacidad.</p>
      </article>

      {/* Derecha: Tabs (login/registro por rol) */}
      <aside className="hero-card">
        <TabsRolAuth />
      </aside>
    </section>
  );
}
