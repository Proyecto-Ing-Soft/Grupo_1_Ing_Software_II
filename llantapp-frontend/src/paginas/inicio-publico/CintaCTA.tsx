import React from "react";
import { Link } from "react-router-dom";

export default function CintaCTA(){
  return (
    <section className="cta-band" aria-label="Llamado a la acción" style={{marginTop:10}}>
      <div className="container cta-inner">
        <h3 style={{fontSize:"clamp(20px,3vw,30px)"}}>¿Listo para tu primer mantenimiento claro?</h3>
        <div className="cta-btns">
          <Link className="btn btn-solid" to="/registro?rol=cliente">Crear cuenta (Cliente)</Link>
          <Link className="btn" to="/login?rol=cliente">Iniciar sesión (Cliente)</Link>
          <span className="lp-sep-vert" />
          <Link className="btn btn-solid" to="/registro?rol=taller">Crear cuenta (Taller)</Link>
          <Link className="btn" to="/login?rol=taller">Iniciar sesión (Taller)</Link>
        </div>
        <p className="hero-note">Al continuar aceptas Términos y Privacidad.</p>
      </div>
    </section>
  );
}
