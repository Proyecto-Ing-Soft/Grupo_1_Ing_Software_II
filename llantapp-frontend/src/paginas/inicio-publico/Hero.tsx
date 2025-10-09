import React from "react";
import TabsRolAuth from "./TabsRolAuth";

export default function Hero(){
  return (
    <section className="container hero-2col" aria-label="Presentación">
      {/* Izquierda: mensaje + bullets */}
      <article className="hero-card">
        <h2 style={{fontSize:"clamp(22px,3.2vw,36px)", lineHeight:1.1, marginBottom:8}}>
          Mantenimiento claro. Taller feliz.
        </h2>
        <p style={{color:"#cfe7f9"}}>
          Registra tu vehículo, consulta mantenimientos y recibe notificaciones del estado.
        </p>
        <ul className="hero-bullets" aria-label="Beneficios">
          <li><span className="dot" /> Registra tu vehículo y su historial.</li>
          <li><span className="dot" /> Sigue el estado: programado → en proceso → terminado.</li>
          <li><span className="dot" /> Recibe y guarda evidencias del trabajo realizado.</li>
          <li><span className="dot" /> Catálogo de servicios y coordinación de atención.</li>
        </ul>
        <p className="hero-note">Tus datos se protegen según nuestras políticas de privacidad.</p>
      </article>

      {/* Derecha: Tabs (login/registro por rol) */}
      <aside className="hero-card">
        <TabsRolAuth />
      </aside>
    </section>
  );
}
