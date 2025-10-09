import React from "react";
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

export default function InicioPublico(){
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
