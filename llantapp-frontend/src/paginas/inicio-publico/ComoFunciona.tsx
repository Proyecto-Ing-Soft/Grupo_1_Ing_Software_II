import React from "react";

export default function ComoFunciona(){
  return (
    <section id="como-funciona" className="container" aria-label="Cómo funciona" style={{padding:"24px 0"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:8}}>Funciona así, sin vueltas.</h3>
      <div className="timeline">
        {/* Cliente */}
        <div className="timeline-group">
          <h4 style={{marginBottom:10}}>Cliente</h4>
          <div className="steps">
            <div className="step"><div className="n">1</div><p>Inicia sesión o crea tu cuenta.</p></div>
            <div className="step"><div className="n">2</div><p>Registra tu vehículo.</p></div>
            <div className="step"><div className="n">3</div><p>Sigue el estado del servicio.</p></div>
            <div className="step"><div className="n">4</div><p>Califica el servicio.</p></div>
          </div>
        </div>

        {/* Taller */}
        <div className="timeline-group" style={{marginTop:12}}>
          <h4 style={{marginBottom:10}}>Taller</h4>
          <div className="steps">
            <div className="step"><div className="n">1</div><p>Registra vehículo si llega nuevo.</p></div>
            <div className="step"><div className="n">2</div><p>Registra mantenimiento y sube evidencias.</p></div>
            <div className="step"><div className="n">3</div><p>Asigna técnico responsable.</p></div>
            <div className="step"><div className="n">4</div><p>Notifica estados y asignaciones.</p></div>
            <div className="step"><div className="n">5</div><p>Consulta historial por unidad.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
