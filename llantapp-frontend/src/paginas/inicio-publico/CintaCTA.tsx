import React from "react";
import { Link } from "react-router-dom";

export default function CintaCTA(){
  return (
    <section className="cta-band" aria-label="Llamado a la acción" style={{marginTop:10}}>
      <div className="container cta-inner">
        <h3 style={{fontSize:"clamp(20px,3vw,30px)"}}>¿Listo para tu primer mantenimiento claro?</h3>
        <div className="cta-grid" role="group" aria-label="Opciones por tipo de usuario">
          {/* Columna Cliente */}
          <div className="cta-col">
            <p className="cta-title">Soy Cliente:</p>

            <Link
              className="btn-cta cliente"
              to="/registro?rol=cliente"
              aria-label="Crear cuenta - Cliente"
            >
              Crear cuenta
            </Link>

            <Link
              className="btn-cta cliente"
              to="/login?rol=cliente"
              aria-label="Iniciar sesión - Cliente"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Columna Taller */}
          <div className="cta-col">
            <p className="cta-title">Soy Administrador de un taller:</p>

            <Link
              className="btn-cta taller"
              to="/registro?rol=taller"
              aria-label="Crear cuenta - Administrador de taller"
            >
              Crear cuenta
            </Link>

            <Link
              className="btn-cta taller"
              to="/login?rol=taller"
              aria-label="Iniciar sesión - Administrador de taller"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
        <p className="hero-note">Al continuar aceptas Términos y Privacidad.</p>
      </div>
    </section>
  );
}
