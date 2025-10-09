import React from "react";

export default function TransparenciaEvidencia(){
  return (
    <section className="band-dark" aria-label="Transparencia y evidencia" style={{padding:"26px 0"}}>
      <div className="container">
        <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:12}}>Transparencia y evidencia</h3>
        <div className="grid-3">
          <article className="tile">
            <h4>Historial completo por vehículo</h4>
            <p>Consulta trabajos realizados y próximos.</p>
          </article>
          <article className="tile">
            <h4>Evidencia visual del servicio</h4>
            <p>Fotos antes/después para respaldar el trabajo.</p>
          </article>
          <article className="tile">
            <h4>Estados claros</h4>
            <p>Sabrás cuándo llevar o recoger tu vehículo.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
