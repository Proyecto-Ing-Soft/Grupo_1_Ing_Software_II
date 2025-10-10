import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function TabsRolAuth(){
  const [tab, setTab] = useState<"cliente"|"taller">("cliente");

  return (
    <section className="auth-box" role="region" aria-label="Accesos por rol">
      <div className="tabs" role="tablist" aria-label="Selecciona tu rol">
        <button className={`tab ${tab==="cliente"?"active":""}`} role="tab" aria-selected={tab==="cliente"} onClick={()=>setTab("cliente")}>Soy Cliente</button>
        <button className={`tab ${tab==="taller"?"active":""}`} role="tab" aria-selected={tab==="taller"} onClick={()=>setTab("taller")}>Soy Taller</button>
      </div>

      {tab==="cliente" ? (
        <div className="tabpanel" role="tabpanel" aria-label="Accesos cliente">
          <p style={{color:"var(--muted-2)", marginBottom:14}}>
            Crea tu cuenta para registrar tu vehículo, ver historial, evidencias y calificar servicios.
          </p>
          <div className="cta-row">
            <Link className="btn btn-solid" to="/login?rol=cliente">Iniciar sesión</Link>
            <Link className="btn btn-solid" to="/registro?rol=cliente">Crear cuenta</Link>
          </div>
          <p className="hero-note" style={{marginTop:10}}>
            * Al continuar aceptas Términos y Privacidad.
          </p>
        </div>
      ) : (
        <div className="tabpanel" role="tabpanel" aria-label="Accesos taller">
          <p style={{color:"var(--muted-2)", marginBottom:14}}>
            Administra mantenimientos, asigna técnicos y notifica estados a tus clientes.
          </p>
          <div className="cta-row">
            <Link className="btn btn-solid" to="/login?rol=taller">Iniciar sesión</Link>
            <Link className="btn btn-solid" to="/registro?rol=taller">Crear cuenta</Link>
          </div>
          <p className="hero-note" style={{marginTop:10}}>
            Próximamente: citas directas por WhatsApp y gestión avanzada por roles.
          </p>
          <p className="hero-note" style={{marginTop:10}}>
            * Al continuar aceptas Términos y Privacidad.
          </p>
        </div>
      )}
    </section>
  );
}

