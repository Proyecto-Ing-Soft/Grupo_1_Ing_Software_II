import React from "react";
import HeaderPublico from "../inicio-publico/HeaderPublico";
import "../inicio-publico/css/inicioPublico.css";
import "./css/contacto.css";
import llontoppSvg from "../../assets/public/landing/Llontopp.svg";

export default function ContactoPagina(){
  const correo = "soporte.llantapp@gmail.com";
  const telefono = "+51 915 060 423";
  const telHref = telefono.replace(/[^+\d]/g, "");

  return (
    <>
      <HeaderPublico />
      <main className="container contact-wrap" aria-label="Contacto">
        <section className="contact-hero">
          <div className="contact-hero-copy">
            <h2 className="section-title">Contacto</h2>
            <p className="contact-sub">Escríbenos y te respondemos pronto.</p>
            <div className="cta-row">
              <a href={`mailto:${correo}`} className="btn-cta cliente">Escríbenos</a>
              <a href={`tel:${telHref}`} className="btn-cta taller">Llámanos</a>
            </div>
          </div>
          <img src={llontoppSvg} alt="" aria-hidden="true" className="marca-llontopp" />
        </section>

        <section className="contact-grid" aria-label="Formas de contacto">
          <article className="contact-card">
            <h4>Email</h4>
            <a className="textlink contact-dato" href={`mailto:${correo}`}>{correo}</a>
            <p className="muted">Atención de Lunes a Viernes, 9:00–18:00</p>
          </article>

          <article className="contact-card">
            <h4>Teléfono</h4>
            <a className="textlink contact-dato" href={`tel:${telHref}`}>{telefono}</a>
            <p className="muted">Si es urgente, mejor llámanos</p>
          </article>

          <article className="contact-card">
            <h4>Centro de ayuda</h4>
            <p className="muted-2">Guías rápidas, preguntas frecuentes y pasos.</p>
            <a href="#/centro-ayuda" className="btn">Ir al centro de ayuda</a>
          </article>
        </section>
      </main>
    </>
  );
}
