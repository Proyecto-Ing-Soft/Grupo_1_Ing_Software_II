import React from "react";

import img1 from "../../assets/public/landing/historias-reales/historia-real-1.png";
import img2a from "../../assets/public/landing/historias-reales/historia-real-2p1.png";
import img2b from "../../assets/public/landing/historias-reales/historia-real-2p2.png";
import img3 from "../../assets/public/landing/historias-reales/historia-real-3.png";

export default function HistoriasCasos() {
  return (
    <section className="container" aria-label="Historias reales" style={{ padding: "24px 0" }}>
      <h3 style={{ fontSize: "clamp(20px,3vw,28px)", marginBottom: 12 }}>
        Historias reales, medición real
      </h3>
      <p style={{ maxWidth: 600, margin: "0 auto 50px", textAlign: "center" }}>      </p>
      <div className="grid-3-cards historias-grid">
        <article className="card story-card">
          <span className="wrap-shape left" aria-hidden="true"></span>

          <figure className="story-thumb bl" aria-hidden="true">
            <img src={img1} alt="Auto de Tomás después del servicio" />
          </figure>

          <div className="story-copy">
            <strong>Cliente Tomás Pino</strong>
            <p className="free-lines">
              <span className="line l1">“Pedí cambio de llanta, me avisaron cuando estuvo listo.</span>
              <span className="line l2">
                Califiqué <span aria-label="5 estrellas" className="stars">5★</span>”.
              </span>
            </p>
          </div>
        </article>

        <article className="card story-card">
          <span className="wrap-shape left" aria-hidden="true"></span>
          <span className="wrap-shape right" aria-hidden="true"></span>

          <figure className="story-thumb tl" aria-hidden="true">
            <img src={img2a} alt="Foto ANTES de la reparación" />
          </figure>
          <figure className="story-thumb br" aria-hidden="true">
            <img src={img2b} alt="Foto DESPUÉS de la reparación" />
          </figure>

          <div className="story-copy">
            <strong>Mecánico Manuel Revilla</strong>
            <p className="free-lines">
              <span className="line l1">“Tomé fotos <b>antes</b> y <b>después</b> de la reparación para que el cliente</span>
              <span className="line l2">vea cómo llegó su vehículo y cómo sale.</span>
              <span className="line l3">Así reforzamos la confianza.”</span>
            </p>
          </div>
        </article>

        <article className="card story-card">
          <span className="wrap-shape right" aria-hidden="true"></span>

          <figure className="story-thumb tr" aria-hidden="true">
            <img src={img3} alt="Administrador asignando mecánicos en Llantapp" />
          </figure>

          <div className="story-copy">
            <strong>Admin de taller, ing. Cusque</strong>
            <p className="free-lines">
              <span className="line l1">“Asigno mis mecánicos con <b>Llantapp</b></span>
              <span className="line l2">y sigo el estado de cada trabajo sin perderme.”</span>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
