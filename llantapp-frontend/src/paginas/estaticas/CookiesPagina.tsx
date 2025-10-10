import React from "react";
import HeaderPublico from "../inicio-publico/HeaderPublico";
import "../inicio-publico/css/inicioPublico.css";
import "./css/cookies.css";
import llontoppSvg from "../../assets/public/landing/Llontopp.svg";

export default function CookiesPagina(){
  return (
    <>
      <HeaderPublico />
      <main className="container cookies-page" style={{padding:"24px 0"}}>
        <section className="cookie-hero">
          <div className="cookie-hero-copy">
            <h2>Política de cookies</h2>
            <p>Usamos cookies para que LlantApp funcione correctamente, recordar tus preferencias y medir de forma anónima el uso del sitio.</p>
            <p>Aquí puedes conocer qué datos se registran, con qué finalidad y durante cuánto tiempo.</p>
            <br />
            <br />
            <br />
          </div>
          <p>
          <img className="cookie-brand" src={llontoppSvg} alt="" aria-hidden="true" /></p>
        </section>

        <section className="cookie-grid">
          <article className="cookie-card">
            <h3>Esenciales</h3>
            <p>Permiten operar el sitio: inicio de sesión, seguridad y enrutamiento.</p>
            <ul>
              <li>Sesión de usuario</li>
              <li>Protección CSRF</li>
              <li>Balanceo de carga</li>
            </ul>
          </article>

          <article className="cookie-card">
            <h3>Preferencias</h3>
            <p>Guardan opciones como idioma o tema para una experiencia consistente.</p>
            <ul>
              <li>Idioma mostrado</li>
              <li>Tema oscuro/claro</li>
            </ul>
          </article>

          <article className="cookie-card">
            <h3>Métricas</h3>
            <p>Nos ayudan a entender el uso del sitio de manera agregada y anónima.</p>
            <ul>
              <li>Páginas visitadas y clics</li>
              <li>Rendimiento y errores</li>
            </ul>
          </article>
        </section>

        <section className="cookie-table">
          <h4>Detalle de cookies</h4>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Finalidad</th>
                  <th>Duración</th>
                  <th>Propietario</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>llantapp_session</td>
                  <td>Esencial</td>
                  <td>Mantener la sesión activa</td>
                  <td>Sesión</td>
                  <td>LlantApp</td>
                </tr>
                <tr>
                  <td>llantapp_csrf</td>
                  <td>Esencial</td>
                  <td>Protección de formularios</td>
                  <td>Sesión</td>
                  <td>LlantApp</td>
                </tr>
                <tr>
                  <td>prefs_lang</td>
                  <td>Preferencia</td>
                  <td>Recordar idioma</td>
                  <td>1 año</td>
                  <td>LlantApp</td>
                </tr>
                <tr>
                  <td>prefs_theme</td>
                  <td>Preferencia</td>
                  <td>Recordar tema oscuro/claro</td>
                  <td>1 año</td>
                  <td>LlantApp</td>
                </tr>
                <tr>
                  <td>metrics_vid</td>
                  <td>Métricas</td>
                  <td>Identificador anónimo de visitas</td>
                  <td>13 meses</td>
                  <td>LlantApp</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="note">Los nombres pueden variar según la versión de la plataforma. No utilizamos cookies para publicidad comportamental.</p>
        </section>

        <section className="cookie-manage">
          <h4>Cómo gestionar las cookies en tu navegador</h4>
          <div className="manage-grid">
            <div className="manage-card">
              <h5>Chrome</h5>
              <p>Ajustes → Privacidad y seguridad → Configuración de sitios → Cookies y datos de sitios.</p>
            </div>
            <div className="manage-card">
              <h5>Edge</h5>
              <p>Configuración → Cookies y permisos del sitio → Administrar y eliminar cookies.</p>
            </div>
            <div className="manage-card">
              <h5>Firefox</h5>
              <p>Ajustes → Privacidad y seguridad → Cookies y datos del sitio.</p>
            </div>
            <div className="manage-card">
              <h5>Safari</h5>
              <p>Preferencias → Privacidad → Gestionar datos de sitios web.</p>
            </div>
          </div>
        </section>

        <section className="cookie-legal">
          <div className="legal-grid">
            <div>
              <h5>Base legal</h5>
              <p>Interés legítimo para operar el servicio y consentimiento para preferencias y métricas.</p>
            </div>
            <div>
              <h5>Vigencia</h5>
              <p>Revisamos esta política de forma periódica. La versión vigente se publica en esta página.</p>
            </div>
            <div>
              <h5>Contacto</h5>
              <p>Si tienes consultas sobre cookies, escríbenos a contacto.llantapp@gmail.com o al +51 915 060 423.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
