import React from "react";
import HeaderPublico from "../inicio-publico/HeaderPublico";
import llontopp from "../../assets/public/landing/Llontopp.svg";
import "./css/terminos.css";

export default function TerminosPagina(){
  return (
    <>
      <HeaderPublico />
      <main className="container terms-page">
        <section className="terms-hero">
          <div className="terms-hero-copy">
            <h1 className="terms-title">Términos y Condiciones</h1>
            <p className="terms-kicker">Al usar LlantApp aceptas estas condiciones de uso. Léelas con atención.</p>
            <div className="terms-updated">Vigente al 10 de octubre de 2025</div>
          </div>
          <img src={llontopp} alt="" aria-hidden="true" className="llontopp-mark" />
        </section>

        <nav className="toc" aria-label="Índice">
          <a href="#cuentas-y-roles">Cuentas y roles</a><br />
          <a href="#uso-aceptable">Uso aceptable</a><br />
          <a href="#servicios-y-responsabilidades">Servicios y responsabilidades</a><br />
          <a href="#mantenimientos-y-evidencias">Mantenimientos y evidencias</a><br />
          <a href="#notificaciones">Notificaciones</a><br />
          <a href="#calificaciones">Calificaciones</a><br />
          <a href="#privacidad">Privacidad y datos</a><br />
          <a href="#disponibilidad">Disponibilidad</a><br />
          <a href="#limitacion">Limitación de responsabilidad</a><br />
          <a href="#modificaciones">Modificaciones</a><br />
          <a href="#contacto">Contacto</a>
        </nav>

        <section className="terms-grid">
          <article className="terms-card" id="cuentas-y-roles">
            <h3>Cuentas y roles</h3>
            <ul>
              <li>El registro requiere datos verídicos y actualizados.</li>
              <li>Los roles disponibles incluyen cliente, mecánico y administrador del taller.</li>
              <li>El titular de la cuenta es responsable del uso realizado bajo sus credenciales.</li>
              <li>Podemos suspender cuentas ante indicios de uso indebido o incumplimientos.</li>
            </ul>
          </article>

          <article className="terms-card" id="uso-aceptable">
            <h3>Uso aceptable</h3>
            <ul>
              <li>No se permite usar la plataforma para actividades ilegales, engañosas o que vulneren derechos de terceros.</li>
              <li>Está prohibido intentar acceder sin autorización a datos, cuentas o sistemas.</li>
              <li>No se permite el abuso de recursos ni acciones que degraden el servicio.</li>
            </ul>
          </article>

          <article className="terms-card" id="servicios-y-responsabilidades">
            <h3>Servicios y responsabilidades</h3>
            <ul>
              <li>La plataforma facilita la gestión entre talleres y clientes para solicitar, asignar y registrar servicios.</li>
              <li>Cada taller es responsable de la ejecución, calidad y seguridad de los servicios que brinda.</li>
              <li>El cliente es responsable de proporcionar información veraz del vehículo y autorizar trabajos.</li>
            </ul>
          </article>

          <article className="terms-card" id="mantenimientos-y-evidencias">
            <h3>Mantenimientos y evidencias</h3>
            <ul>
              <li>Los mantenimientos pueden registrarse con fecha, estado y detalle del servicio realizado.</li>
              <li>Se permite subir evidencia visual (fotos o videos) asociada al servicio, respetando la privacidad de personas y placas si corresponde.</li>
              <li>El historial por vehículo se conserva para trazabilidad salvo solicitud válida de eliminación conforme a la normativa aplicable.</li>
            </ul>
          </article>

          <article className="terms-card" id="notificaciones">
            <h3>Notificaciones</h3>
            <ul>
              <li>La plataforma puede enviar avisos sobre asignaciones, cambios de estado y finalización del servicio.</li>
              <li>El usuario es responsable de mantener activos y correctos sus medios de contacto.</li>
            </ul>
          </article>

          <article className="terms-card" id="calificaciones">
            <h3>Calificaciones</h3>
            <ul>
              <li>Los clientes pueden calificar con estrellas y comentarios de forma respetuosa y basada en su experiencia real.</li>
              <li>Podremos moderar contenido que incumpla estas condiciones o la ley.</li>
            </ul>
          </article>

          <article className="terms-card" id="privacidad">
            <h3>Privacidad y datos</h3>
            <ul>
              <li>Tratamos datos personales según la normativa vigente y lo necesario para operar la plataforma.</li>
              <li>El usuario puede ejercer derechos de acceso, rectificación o eliminación cuando corresponda.</li>
              <li>Más detalles se establecen en la política de privacidad aplicable.</li>
            </ul>
          </article>

          <article className="terms-card" id="disponibilidad">
            <h3>Disponibilidad</h3>
            <ul>
              <li>Buscamos alta disponibilidad, pero el servicio puede verse interrumpido por mantenimiento, actualizaciones o causas externas.</li>
              <li>No garantizamos disponibilidad continua ni ausencia de errores.</li>
            </ul>
          </article>

          <article className="terms-card" id="limitacion">
            <h3>Limitación de responsabilidad</h3>
            <ul>
              <li>LlantApp no asume responsabilidad por trabajos ejecutados por terceros ni por pérdida indirecta o lucro cesante.</li>
              <li>Nuestra responsabilidad total se limita al máximo permitido por la ley aplicable.</li>
            </ul>
          </article>

          <article className="terms-card" id="modificaciones">
            <h3>Modificaciones</h3>
            <ul>
              <li>Podemos actualizar estos términos para reflejar mejoras del servicio o cambios regulatorios.</li>
              <li>El uso continuado tras una actualización implica la aceptación de la nueva versión.</li>
            </ul>
          </article>

          <article className="terms-card" id="contacto">
            <h3>Contacto</h3>
            <ul>
              <li>Correo: soporte.llantapp@gmail.com</li>
              <li>Teléfono: +51 915 060 423</li>
            </ul>
          </article>
        </section>
      </main>
    </>
  );
}
