import React from "react";
import HeaderPublico from "../inicio-publico/HeaderPublico";
import "../inicio-publico/css/inicioPublico.css";
import "./css/privacidad.css";
import marcaLlontopp from "../../assets/public/landing/Llontopp.svg";

export default function PrivacidadPagina(){
  return (
    <>
      <HeaderPublico />
      <main className="priv-page">
        <section className="priv-hero container">
          <div className="priv-hero-copy">
            <h2>Política de privacidad</h2>
            <p>Te contamos qué datos tratamos, con qué fines y cómo puedes ejercer tus derechos.</p>
            <div className="priv-meta">
              <span className="chip">Transparencia</span>
              <span className="chip">Seguridad</span>
              <span className="chip">Control del usuario</span>
            </div>
          </div>
          <img src={marcaLlontopp} alt="" className="priv-brand" aria-hidden="true" />
        </section>

        <section className="priv-grid container">
          <article className="priv-card">
            <h3>Datos que recolectamos</h3>
            <ul className="check">
              <li>Identificación y contacto: nombre, correo, teléfono.</li>
              <li>Cuenta y autenticación: credenciales cifradas, roles y permisos.</li>
              <li>Vehículos y servicios: placas, características, citas y mantenimientos.</li>
              <li>Evidencias del servicio: fotos y videos subidos por el taller.</li>
              <li>Uso de la plataforma: logs técnicos, IP, dispositivo e interacciones.</li>
            </ul>
          </article>

          <article className="priv-card">
            <h3>Para qué usamos tus datos</h3>
            <ul className="check">
              <li>Prestar el servicio y gestionar mantenimientos y solicitudes.</li>
              <li>Notificar estados, asignaciones y recordatorios.</li>
              <li>Mejorar la experiencia y la seguridad de la plataforma.</li>
              <li>Cumplir obligaciones legales y atender reclamos.</li>
            </ul>
            <p className="muted-sm">Base legal: ejecución de contrato, interés legítimo y, cuando aplique, tu consentimiento.</p>
          </article>

          <article className="priv-card">
            <h3>Conservación</h3>
            <p>Conservamos los datos mientras tengas una cuenta activa y por el tiempo necesario para cumplir finalidades, obligaciones legales o defensa de reclamaciones.</p>
          </article>

          <article className="priv-card">
            <h3>Tus derechos</h3>
            <ul className="check">
              <li>Acceder, rectificar y actualizar tu información.</li>
              <li>Solicitar eliminación cuando corresponda.</li>
              <li>Oponerte o limitar el tratamiento en ciertos casos.</li>
              <li>Portar tus datos en formato estructurado.</li>
            </ul>
            <p className="muted-sm">Para ejercerlos, ingresa a tu cuenta o contáctanos.</p>
          </article>

          <article className="priv-card">
            <h3>Cookies y tecnologías similares</h3>
            <p>Usamos cookies necesarias para el funcionamiento y, con tu autorización, analíticas para entender el uso y mejorar el producto. Puedes gestionarlas desde tu navegador.</p>
          </article>

          <article className="priv-card">
            <h3>Seguridad</h3>
            <ul className="check">
              <li>Cifrado en tránsito mediante HTTPS.</li>
              <li>Controles de acceso por roles.</li>
              <li>Registros de actividad y monitoreo.</li>
            </ul>
          </article>

          <article className="priv-card">
            <h3>Contacto</h3>
            <p>Si tienes dudas o solicitudes sobre privacidad:</p>
            <ul className="contact">
              <li><a href="mailto:contacto.llantapp@gmail.com">contacto.llantapp@gmail.com</a></li>
              <li><a href="tel:+51915060423">+51 915 060 423</a></li>
            </ul>
          </article>
        </section>

        <section className="priv-footer container">
          <small>Última actualización: 10/10/2025</small>
        </section>
      </main>
    </>
  );
}
