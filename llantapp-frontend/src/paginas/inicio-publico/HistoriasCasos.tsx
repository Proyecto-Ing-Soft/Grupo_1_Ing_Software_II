import React from "react";

export default function HistoriasCasos(){
  return (
    <section className="container" aria-label="Historias reales" style={{padding:"24px 0"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:12}}>Historias reales, medición real</h3>
      <div className="grid-3-cards">
        <article className="card">
          <strong>Cliente Ramón</strong>
          <p>“Pedí cambio de llanta, me avisaron cuando estuvo listo, califiqué 5★.”</p>
        </article>
        <article className="card">
          <strong>Taller Ruta Sur</strong>
          <p>“Asigné a Ana como técnica, subimos fotos de entrega.”</p>
        </article>
        <article className="card">
          <strong>Flota liviana</strong>
          <p>“Revisamos historial de cada unidad.”</p>
        </article>
      </div>
    </section>
  );
}
