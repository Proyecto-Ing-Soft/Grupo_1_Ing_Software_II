import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FooterPublico(){
  const [cookiesOk, setCookiesOk] = useState<boolean>(true);
  useEffect(()=>{
    try{
      const v = localStorage.getItem("llantapp.cookies.ok");
      setCookiesOk(v==="1");
    }catch{}
  },[]);
  const aceptar = () => { try{ localStorage.setItem("llantapp.cookies.ok","1"); }catch{}; setCookiesOk(true); };

  return (
    <footer id="contacto" className="footer" aria-label="Pie de página">
      <div className="container" style={{padding:"24px 0"}}>
        <div id="seguridad" style={{marginBottom:20}}>
          <h3 style={{fontSize:"clamp(18px,2.4vw,22px)", marginBottom:6}}>Seguridad</h3>
          <p style={{color:"#bcd4e6"}}>
            Encriptamos credenciales, auditamos acciones por rol y protegemos evidencias con permisos. Accesibilidad AA.
          </p>
        </div>

        <div className="cols">
          <div>
            <h5>Ayuda</h5>
            <ul style={{display:"grid", gap:6}}>
              <Link to="/centro-ayuda">Centro de ayuda</Link>
              <Link to="/contacto">Contacto</Link>
              <Link to="/libro-reclamaciones">Libro de reclamaciones</Link>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul style={{display:"grid", gap:6}}>
              <Link to="/terminos">Términos de uso</Link>
              <Link to="/privacidad">Privacidad</Link>
              <Link to="/cookies">Cookies</Link>
            </ul>
          </div>
          <div>
            <h5>Para talleres</h5>
            <ul style={{display:"grid", gap:6}}>
              <Link to="/registro?rol=taller">Comenzar con LlantApp</Link>
              <a href="#como-funciona">Checklist de onboarding</a>
            </ul>
          </div>
          <div>
            <h5>Para clientes</h5>
            <ul style={{display:"grid", gap:6}}>
              <Link to="/registro?rol=cliente">Crear cuenta</Link>
              <Link to="/login?rol=cliente">Ver mis servicios</Link>
            </ul>
          </div>
          <div>
            <h5>Apps</h5>
            <div style={{opacity:.5}}>App Store (Próximamente)</div>
            <div style={{opacity:.5}}>Google Play (Próximamente)</div>
            <div style={{marginTop:8, color:"#9fb0c0"}}>Perú (ES)</div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2025 LlantApp</div>
          <div className="cookies">
            {!cookiesOk && (
              <>
                <span>Usamos cookies para mejorar tu experiencia.</span>
                <button className="btn btn-solid" onClick={aceptar}>Aceptar</button>
                <button className="btn">Configurar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
