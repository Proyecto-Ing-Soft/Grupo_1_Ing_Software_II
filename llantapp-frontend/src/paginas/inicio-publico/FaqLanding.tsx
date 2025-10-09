import React from "react";

export default function FaqLanding(){
  return (
    <section id="faq" className="container" aria-label="Preguntas frecuentes" style={{padding:"22px 0"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:12}}>Preguntas frecuentes</h3>
      <div className="faq" style={{display:"grid", gap:10}}>
        <details>
          <summary>¿Qué es LlantApp?</summary>
          <p>Plataforma para talleres y clientes que registra vehículos y mantenimientos, notifica estados, sube evidencias y permite coordinar servicios de forma simple.</p>
        </details>
        <details>
          <summary>¿Cómo solicito un servicio?</summary>
          <p>Inicia sesión / regístrate y elige del catálogo; el taller te contactará para coordinar.</p>
        </details>
        <details>
          <summary>¿Puedo ver el historial de mi vehículo?</summary>
          <p>Sí, al crear tu cuenta podrás ver mantenimientos realizados y próximos.</p>
        </details>
        <details>
          <summary>¿Cómo sé en qué estado va mi mantenimiento?</summary>
          <p>Verás estados (programado/en proceso/terminado) y recibirás avisos.</p>
        </details>
        <details>
          <summary>¿El taller deja evidencia?</summary>
          <p>Sí, fotos del diagnóstico/entrega quedan asociadas al servicio.</p>
        </details>
        <details>
          <summary>¿Quién trabaja en mi vehículo?</summary>
          <p>El taller asigna un técnico responsable para trazabilidad.</p>
        </details>
        <details>
          <summary>¿Puedo calificar el servicio?</summary>
          <p>Sí, con estrellas y comentario al finalizar.</p>
        </details>
        <details>
          <summary>¿Qué vendrá después?</summary>
          <p>Roles/permisos, inventario, flotas, reportes, recomendaciones y registro en campo. (Próximamente)</p>
        </details>
      </div>
    </section>
  );
}
