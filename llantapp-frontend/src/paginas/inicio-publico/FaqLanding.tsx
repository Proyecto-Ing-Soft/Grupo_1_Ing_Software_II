import React from "react";

export default function FaqLanding(){
  return (
    <section id="faq" className="container" aria-label="Preguntas frecuentes" style={{padding:"22px 0"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:12}}>Preguntas frecuentes</h3>

      <div className="faq" style={{display:"grid", gap:10}}>
        <details>
          <summary>¿Qué es LlantApp?</summary>
          <p style={{marginTop:8}}>
            LlantApp es una plataforma pensada para <strong>talleres</strong> y <strong>clientes</strong> que
            centraliza el registro técnico por vehículo (por placa) y promueve la <strong>transparencia</strong>.
            Ayuda a documentar correctamente lo que se hace al auto y a compartirlo con su dueño.
          </p>
          <ul style={{margin:"8px 0 0 20px"}}>
            <li><strong>Historial por placa:</strong> cada intervención queda guardada con fecha, servicio, repuestos y observaciones.</li>
            <li><strong>Evidencia visual:</strong> fotos y videos del diagnóstico/proceso/entrega para que “se vea el trabajo”.</li>
            <li><strong>Alertas y recordatorios:</strong> mantenimiento próximo, vencimiento de llantas y notificaciones útiles.</li>
            <li><strong>Roles y trazabilidad:</strong> se asigna un técnico responsable en cada servicio para saber quién hizo qué.</li>
            <li><strong>Acceso multiplataforma:</strong> funciona en web y puede consultarse desde distintos dispositivos.</li>
          </ul>
        </details>

        <details>
          <summary>¿Cómo solicito un servicio?</summary>
          <p style={{marginTop:8}}>
            Es sencillo y rápido. Así te aseguras de que el taller reciba la solicitud con todos los datos.
          </p>
          <ol style={{margin:"8px 0 0 20px"}}>
            <li><strong>Entra o regístrate:</strong> crea tu cuenta o inicia sesión.</li>
            <li><strong>Elige el servicio:</strong> desde el catálogo (ej. revisión, cambio de aceite, llantas, etc.).</li>
            <li><strong>Confirma la solicitud:</strong> añade notas o fotos si lo crees necesario.</li>
            <li><strong>Coordinación:</strong> el taller te contactará (teléfono/WhatsApp) para agendar y confirmar.</li>
          </ol>
          <p style={{marginTop:8,opacity:.9}}>
            Nota: por ahora la coordinación de horarios y el pago se confirman directamente con el taller.
          </p>
        </details>

        <details>
          <summary>¿Puedo ver el historial de mi vehículo?</summary>
          <p style={{marginTop:8}}>
            Sí. Con tu cuenta puedes consultar el <strong>historial completo por placa</strong>:
          </p>
          <ul style={{margin:"8px 0 0 20px"}}>
            <li>Servicios realizados, fechas, repuestos utilizados y observaciones del técnico.</li>
            <li>Evidencia visual (fotos/videos) asociada a cada intervención.</li>
            <li>Próximos mantenimientos recomendados según uso y registros previos.</li>
          </ul>
        </details>

        <details>
          <summary>¿Cómo sé en qué estado va mi mantenimiento?</summary>
          <p style={{marginTop:8}}>
            Verás el estado del servicio en todo momento y recibirás avisos importantes:
          </p>
          <ul style={{margin:"8px 0 0 20px"}}>
            <li><strong>Programado → En proceso → Terminado:</strong> flujo claro y visible en tu panel.</li>
            <li><strong>Notificaciones automáticas:</strong> cuando haya cambios relevantes o próximos hitos.</li>
            <li><strong>Bitácora visible:</strong> el taller puede ir agregando notas y evidencia mientras avanza.</li>
          </ul>
        </details>

        <details>
          <summary>¿El taller deja evidencia?</summary>
          <p style={{marginTop:8}}>
            Sí. El técnico sube <strong>fotos y/o videos</strong> del diagnóstico, del proceso y de la entrega.
            Esa evidencia queda <strong>vinculada al historial</strong> del vehículo para consulta posterior.
          </p>
          <ul style={{margin:"8px 0 0 20px"}}>
            <li>Archivos válidos y de tamaño permitido quedan guardados junto al servicio.</li>
            <li>Toda la evidencia se organiza por fecha y por tipo de intervención.</li>
          </ul>
        </details>

        <details>
          <summary>¿Quién trabaja en mi vehículo?</summary>
          <p style={{marginTop:8}}>
            Cada servicio tiene un <strong>técnico responsable asignado</strong>. Esto permite
            <strong>trazabilidad</strong> y orden interno en el taller.
          </p>
          <ul style={{margin:"8px 0 0 20px"}}>
            <li>Ves qué técnico estuvo a cargo del trabajo.</li>
            <li>Queda registro para consultas futuras o aclaraciones.</li>
          </ul>
        </details>

        <details>
          <summary>¿Puedo calificar el servicio?</summary>
          <p style={{marginTop:8}}>
            Sí. Al finalizar, puedes dejar una <strong>calificación (1 a 5 estrellas) y un comentario</strong>.
            Si no respondes dentro de un tiempo razonable, el sistema lo marca como no respondido.
          </p>
          <p style={{marginTop:8,opacity:.9}}>
            Esto ayuda al taller a mejorar y a otros clientes a tener más confianza.
          </p>
        </details>

        <details>
          <summary>¿Qué vendrá después?</summary>
          <p style={{marginTop:8}}>
            Estamos construyendo más funciones para que la experiencia sea cada vez mejor:
          </p>
          <ul style={{margin:"8px 0 0 20px"}}>
            <li><strong>Roles y permisos</strong> más granulares.</li>
            <li><strong>Inventario</strong> con alertas de stock bajo.</li>
            <li><strong>Gestión de flotas</strong> (empresas) y programación de mantenimientos.</li>
            <li><strong>Reportes y dashboards</strong> técnicos y de desempeño.</li>
            <li><strong>Recomendaciones</strong> automáticas (ej. cambio de llantas/aceite según uso).</li>
            <li><strong>Registro en campo</strong> desde tablets o móviles con sincronización.</li>
          </ul>
          <p style={{marginTop:8,opacity:.9}}>
            Algunas de estas capacidades ya están en desarrollo y se liberarán progresivamente.
          </p>
        </details>
      </div>
    </section>
  );
}
