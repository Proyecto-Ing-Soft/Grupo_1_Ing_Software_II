import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.jpg";

export default function HeaderPublico(){
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return ()=>window.removeEventListener("scroll", onScroll);
  },[]);
  return (
    <header className={`lp-header ${scrolled ? "scrolled":""}`}>
      <div className="container lp-header-inner">
        {/* Izquierda: logo + idioma */}
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <a className="lp-logo" href="#top" aria-label="LlantApp inicio">
            <img src={logo} alt="LlantApp" />
            <span>LlantApp</span>
          </a>
          <span className="lp-sep-vert" />
          <div className="lp-lang" role="button" aria-label="Cambiar idioma">
            <span className="globe" aria-hidden>🌐</span> <span>ES</span>
          </div>
        </div>

        {/* Centro: anchors internos */}
        <nav className="lp-nav" aria-label="Navegación principal">
          <a href="#servicios">Servicios</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#faq">Preguntas frecuentes</a>
          <a href="#seguridad">Seguridad</a>
          <a href="#contacto">Contacto</a>
        </nav>

        {/* Derecha: Cliente / Taller */}
        <div className="lp-actions" aria-label="Acciones rápidas">
          {/* Cliente */}
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <Link className="btn btn-ghost" to="/login?rol=cliente" aria-label="Iniciar sesión cliente">
              Iniciar sesión <span className="badge-role">Cliente</span>
            </Link>
            <Link className="btn btn-solid" to="/registro?rol=cliente" aria-label="Crear cuenta cliente">
              Crear cuenta <span className="badge-role">Cliente</span>
            </Link>
          </div>
          <span className="lp-sep-vert" />
          {/* Taller */}
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <Link className="btn" to="/login?rol=taller" aria-label="Iniciar sesión taller">
              Iniciar sesión <span className="badge-role">Taller</span>
            </Link>
            <Link className="btn btn-solid" to="/registro?rol=taller" aria-label="Crear cuenta taller">
              Crear cuenta <span className="badge-role">Taller</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
