import React from "react";

export default function CookiesPagina(){
  return (
    <main className="container" style={{padding:"24px 0"}}>
      <h2 style={{marginBottom:8}}>Política de cookies</h2>
      <p>Usamos cookies para mantener tu sesión y mejorar la experiencia.</p>
      <ul style={{marginTop:10}}>
        <li>Cookies de sesión (necesarias).</li>
        <li>Preferencias (idioma/tema).</li>
        <li>Métricas de uso (anónimas).</li>
      </ul>
    </main>
  );
}
