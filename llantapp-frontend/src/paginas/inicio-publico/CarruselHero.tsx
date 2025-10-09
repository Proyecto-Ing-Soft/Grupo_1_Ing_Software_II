import React, { useEffect, useState } from "react";
import img1 from "../../assets/public/landing/carrusel/1-registro-vehiculo.jpg";
import img2 from "../../assets/public/landing/carrusel/2-seguimiento-estado.jpg";
import img3 from "../../assets/public/landing/carrusel/3-evidencia-visual.jpg";
import img4 from "../../assets/public/landing/carrusel/4-solicita-servicio.jpg";
import img5 from "../../assets/public/landing/carrusel/5-calificacion-servicio.jpg";

const SLIDES = [
  { src: img1, alt: "Registra vehículo e historial (US-00/US-01)" },
  { src: img2, alt: "Sigue estados: programado → en proceso → terminado (US-03)" },
  { src: img3, alt: "Evidencia visual: fotos antes/después (US-05)" },
  { src: img4, alt: "Solicita del catálogo y te contactan (US-10)" },
  { src: img5, alt: "Califica el servicio al finalizar (US-16)" },
];

export default function CarruselHero(){
  const [i, setI] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=> setI(s => (s+1)%SLIDES.length), 4200);
    return ()=>clearInterval(t);
  },[]);
  return (
    <section className="hero-carousel" aria-label="¿Qué es LlantApp?">
      <div className="slides" aria-hidden>
        {SLIDES.map((s, idx)=>(
          <div key={idx}
               className={`slide ${i===idx?"active":""}`}
               style={{backgroundImage:`url(${s.src})`}}
               role="img"
               aria-label={s.alt}/>
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="container hero-content">
        <div className="hero-content-inner">
          <div className="hero-kicker">LlantApp</div>
          <h1 className="hero-title">Mantenimiento claro. Taller feliz.</h1>
          <p className="hero-sub">
            Registra tu vehículo, gestiona mantenimientos y sigue su estado desde un solo lugar.
            Transparencia, evidencia y notificaciones en tiempo real.
          </p>
          <div className="hero-pills" role="list">
            <span className="pill">Registro de vehículo</span>
            <span className="pill">Historial y evidencias</span>
            <span className="pill">Estados claros</span>
            <span className="pill">Notificaciones</span>
            <span className="pill">Calificación</span>
          </div>
        </div>
      </div>
    </section>
  );
}
