import React, { useEffect } from "react";
import "./css/inicioPublico.css";
import HeaderPublico from "./HeaderPublico";
import CarruselHero from "./CarruselHero";
import Hero from "./Hero";
import ServiciosDestacados from "./ServiciosDestacados";
import ComoFunciona from "./ComoFunciona";
import TransparenciaEvidencia from "./TransparenciaEvidencia";
import HistoriasCasos from "./HistoriasCasos";
import ProximamentePills from "./ProximamentePills";
import FaqLanding from "./FaqLanding";
import CintaCTA from "./CintaCTA";
import FooterPublico from "./FooterPublico";

import marcaLlontopp from "../../assets/public/landing/Llontopp.svg";

export default function InicioPublico(){
  useEffect(() => {
    const cuerpo = document.body;

    cuerpo.classList.add("landing-publico");

    cuerpo.style.setProperty("--llontopp", `url("${marcaLlontopp}")`);

    let imagenInyectada: HTMLImageElement | null = null;
    const carruselHeroe = document.querySelector<HTMLElement>(".hero-carousel");
    if (carruselHeroe && !carruselHeroe.querySelector(".hero-brand")) {
      imagenInyectada = document.createElement("img");
      imagenInyectada.src = marcaLlontopp;
      imagenInyectada.alt = "Llontopp";
      imagenInyectada.className = "hero-brand";
      carruselHeroe.appendChild(imagenInyectada);
    }

    return () => {
      cuerpo.classList.remove("landing-publico");
      cuerpo.style.removeProperty("--llontopp");
      if (imagenInyectada && imagenInyectada.parentNode) {
        imagenInyectada.parentNode.removeChild(imagenInyectada);
      }
    };
  }, []);

  return (
    <main id="top">
      <HeaderPublico />
      <CarruselHero />
      <Hero />
      <ServiciosDestacados />
      <ComoFunciona />
      <TransparenciaEvidencia />
      <HistoriasCasos />
      <ProximamentePills />
      <FaqLanding />
      <CintaCTA />
      <FooterPublico />
    </main>
  );
}
