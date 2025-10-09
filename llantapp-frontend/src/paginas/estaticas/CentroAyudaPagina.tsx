import React from "react";

export default function CentroAyudaPagina(){
  return (
    <main className="container" style={{padding:"24px 0"}}>
      <h2 style={{marginBottom:8}}>Centro de ayuda</h2>
      <p>Encuentra respuestas a preguntas frecuentes y guías rápidas.</p>
      <ul style={{marginTop:14, lineHeight:1.9}}>
        <li><a href="#/faq">Preguntas frecuentes (en la landing)</a></li>
        <li>Cómo crear mi cuenta cliente</li>
        <li>Cómo registrar mi vehículo</li>
        <li>Cómo ver estados y evidencias</li>
      </ul>
    </main>
  );
}
