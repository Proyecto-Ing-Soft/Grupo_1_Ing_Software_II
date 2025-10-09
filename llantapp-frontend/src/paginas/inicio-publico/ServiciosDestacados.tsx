import React from "react";
import { useNavigate } from "react-router-dom";
import { setPreSeleccion } from "./hooks/usePreseleccionServicio";
import { ServicioCard } from "./types";

// íconos
import icCambioLlanta from "../../assets/public/landing/servicios/cambio-llanta.svg";
import icBalanceo from "../../assets/public/landing/servicios/balanceo.svg";
import icAlineacion from "../../assets/public/landing/servicios/alineacion.svg";
import icAceite from "../../assets/public/landing/servicios/cambio-aceite.svg";
import icFrenos from "../../assets/public/landing/servicios/frenos.svg";
import icDiag from "../../assets/public/landing/servicios/diagnostico.svg";

const DATA: ServicioCard[] = [
  { slug:"cambio-llanta", nombre:"Cambio de llanta", descripcion:"Revisión y reemplazo de neumático.", icon: icCambioLlanta },
  { slug:"balanceo", nombre:"Balanceo", descripcion:"Elimina vibraciones del rodaje.", icon: icBalanceo },
  { slug:"alineacion", nombre:"Alineación", descripcion:"Dirección recta y desgaste uniforme.", icon: icAlineacion },
  { slug:"cambio-aceite", nombre:"Cambio de aceite", descripcion:"Lubricación y vida útil del motor.", icon: icAceite },
  { slug:"frenos", nombre:"Revisión de frenos", descripcion:"Mayor seguridad al conducir.", icon: icFrenos },
  { slug:"diagnostico", nombre:"Diagnóstico general", descripcion:"Detecta fallas y planifica.", icon: icDiag },
];

export default function ServiciosDestacados(){
  const nav = useNavigate();
  const elegir = (s: ServicioCard) => {
    setPreSeleccion({ slug: s.slug, nombre: s.nombre });
    nav("/login?rol=cliente"); // el flujo de solicitud se realiza tras autenticarse
  };

  return (
    <section id="servicios" className="container" aria-label="Servicios más solicitados" style={{padding:"22px 0 10px"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", margin:"8px 0 12px"}}>Servicios más solicitados</h3>
      <div className="grid-services">
        {DATA.map(s=>(
          <article key={s.slug} className="card-service" aria-label={s.nombre}>
            <img src={s.icon} alt="" />
            <h4>{s.nombre}</h4>
            <p>{s.descripcion}</p>
            <button className="btn btn-mini" onClick={()=>elegir(s)} aria-label={`Quiero ${s.nombre}`}>
              Quiero este servicio
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
