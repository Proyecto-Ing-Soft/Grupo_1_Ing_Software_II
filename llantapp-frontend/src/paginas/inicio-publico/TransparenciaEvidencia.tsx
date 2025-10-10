import React from "react";

import imgHistorial from "../../assets/public/landing/transparencia-evidencia/historial-completo-por-vehiculo.png";
import imgEvidencia from "../../assets/public/landing/transparencia-evidencia/evidencia-visual-del-servicio.png";
import imgEstados from "../../assets/public/landing/transparencia-evidencia/estados-claros.png";

export default function TransparenciaEvidencia(){
  return (
    
    <section className="band-dark" aria-label="Transparencia y evidencia" style={{padding:"24px 0"}}>
      <div className="container">
        <h3 style={{fontSize:"clamp(20px,3vw,28px)", margin:"8px 0 12px"}}>Transparencia y evidencia</h3>

        <div className="band-panel">
          <div className="grid-3">
            <article className="tile">
              <div className="tile-media">
                <img
                  src={imgHistorial}
                  alt="Historial completo por vehículo: trabajos realizados y próximos"
                  loading="lazy"
                />
              </div>
              <h4>Historial completo por vehículo</h4>
              <p>Consulta trabajos realizados y próximos.</p>
            </article>

            <article className="tile">
              <div className="tile-media">
                <img
                  src={imgEvidencia}
                  alt="Evidencia visual del servicio: fotos del antes y después"
                  loading="lazy"
                />
              </div>
              <h4>Evidencia visual del servicio</h4>
              <p>Fotos antes/después para respaldar el trabajo.</p>
            </article>

            <article className="tile">
              <div className="tile-media">
                <img
                  src={imgEstados}
                  alt="Estados claros del mantenimiento y entregas"
                  loading="lazy"
                />
              </div>
              <h4>Estados claros</h4>
              <p>Sabrás cuándo llevar o recoger tu vehículo.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
