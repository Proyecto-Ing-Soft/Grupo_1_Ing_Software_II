import React from "react";

import LineaT from "../../assets/public/landing/LineaT.png";

import cliente1 from "../../assets/public/landing/como-funciona/cliente-1.png";
import cliente2 from "../../assets/public/landing/como-funciona/cliente-2.png";
import cliente3 from "../../assets/public/landing/como-funciona/cliente-3.png";
import cliente4 from "../../assets/public/landing/como-funciona/cliente-4.png";
import cliente5 from "../../assets/public/landing/como-funciona/cliente-5.png";

import taller1 from "../../assets/public/landing/como-funciona/taller-1.png";
import taller2 from "../../assets/public/landing/como-funciona/taller-2.png";
import taller3 from "../../assets/public/landing/como-funciona/taller-3.png";
import taller4 from "../../assets/public/landing/como-funciona/taller-4.png";
import taller5 from "../../assets/public/landing/como-funciona/taller-5.png";

export default function ComoFunciona(){
  return (
    <section
      id="como-funciona"
      className="container"
      aria-label="Cómo funciona"
      style={{padding:"24px 0 8px"}}   /* un poquito más de aire inferior */
    >
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:8}}>Funciona así, sin vueltas.</h3>

      <div className="timeline">

        {/* Cliente */}
        <div className="timeline-group">
          <h4>Cliente</h4>

          <div className="steps steps-5 steps-rail zigzag-5" data-linea>

            <img
              src={LineaT}
              alt=""
              aria-hidden="true"
              className="steps-linea"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{
                ["--linea-w" as any]: "780px",
                ["--linea-h" as any]: "230px",
                ["--linea-x" as any]: "27px",
                ["--linea-y" as any]: "2px",
              }}
            />


            <div className="step">
              <div className="n">1</div>
              <div className="step-body">
                <img className="step-avatar" src={cliente1} alt="Cliente - Entra en segundos" loading="lazy"/>
                <p><span className="exclaim">¡Entra en segundos!</span> Inicia sesión o crea tu cuenta.</p>
              </div>
            </div>

            <div className="step">
              <div className="n">2</div>
              <div className="step-body">
                <img className="step-avatar" src={cliente2} alt="Cliente - Tu auto ya debería estar ahí" loading="lazy"/>
                <p><span className="exclaim">¡Tu auto ya debería estar ahí!</span> Verifica que aparezca (lo registra el taller).</p>
              </div>
            </div>

            <div className="step">
              <div className="n">3</div>
              <div className="step-body">
                <img className="step-avatar" src={cliente3} alt="Cliente - Todo bajo control" loading="lazy"/>
                <p><span className="exclaim">¡Todo bajo control!</span> Consulta el historial por placa cuando quieras.</p>
              </div>
            </div>

            <div className="step">
              <div className="n">4</div>
              <div className="step-body">
                <img className="step-avatar" src={cliente4} alt="Cliente - No te olvides más" loading="lazy"/>
                <p><span className="exclaim">¡No te olvides más!</span> Recibe alertas cuando se acerquen mantenimientos.</p>
              </div>
            </div>

            <div className="step">
              <div className="n">5</div>
              <div className="step-body">
                <img className="step-avatar" src={cliente5} alt="Cliente - Cierra con broche de oro" loading="lazy"/>
                <p><span className="exclaim">¡Cierra con broche de oro!</span> Recibe recordatorios por vencimiento de llantas y califica el servicio al final.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taller */}
        <div className="timeline-group" style={{marginTop:12}}>
          <h4>Taller</h4>

          <div className="steps steps-5 steps-rail zigzag-5" data-linea>

            <img
              src={LineaT}
              alt=""
              aria-hidden="true"
              className="steps-linea taller"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{
                ["--linea-w" as any]: "779px",
                ["--linea-h" as any]: "204px",
                ["--linea-x" as any]: "27px",
                ["--linea-y" as any]: "5px",
              }}
            />

            <div className="step">
              <div className="n">1</div>
              <div className="step-body">
                <img className="step-avatar" src={taller1} alt="Taller - Vehículo nuevo a la vista" loading="lazy"/>
                <p><span className="exclaim">¡Vehículo nuevo a la vista!</span> Regístralo con los datos básicos (admin o mecánico).</p>
              </div>
            </div>

            <div className="step">
              <div className="n">2</div>
              <div className="step-body">
                <img className="step-avatar" src={taller2} alt="Taller - Orden total" loading="lazy"/>
                <p><span className="exclaim">¡Orden total!</span> Asigna al técnico responsable.</p>
              </div>
            </div>

            <div className="step">
              <div className="n">3</div>
              <div className="step-body">
                <img className="step-avatar" src={taller3} alt="Taller - Bitácora completa" loading="lazy"/>
                <p><span className="exclaim">¡Bitácora completa!</span> Registra el mantenimiento e incluye el estado de cada llanta.</p>
              </div>
            </div>

            <div className="step">
              <div className="n">4</div>
              <div className="step-body">
                <img className="step-avatar" src={taller4} alt="Taller - Que se vea el trabajo" loading="lazy"/>
                <p><span className="exclaim">¡Que se vea el trabajo!</span> Sube evidencias (fotos/videos).</p>
              </div>
            </div>

            <div className="step">
              <div className="n">5</div>
              <div className="step-body">
                <img className="step-avatar" src={taller5} alt="Taller - Trazabilidad al 100%" loading="lazy"/>
                <p><span className="exclaim">¡Trazabilidad al 100%!</span> Consulta el historial por unidad (placa) cuando lo necesites.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
