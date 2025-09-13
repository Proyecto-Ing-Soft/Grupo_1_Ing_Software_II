import '../estilos/ContenidoLegal.css';

export default function Contacto() {
  return (
    <div className="contenido-legal-container">
      <div className="contenido-box">
        <h2>Contacto</h2>
        <p>¿Tienes alguna pregunta, sugerencia o problema? Puedes comunicarte con nosotros a través de los siguientes medios:</p>
        <ul>
          <li><strong>Correo electrónico:</strong> soporte@gepetocamisetas.com</li>
          <li><strong>Teléfono:</strong> +51 999 888 777</li>
          <li><strong>Horario de atención:</strong> Lunes a viernes de 9:00 a.m. a 6:00 p.m.</li>
          <li><strong>Dirección:</strong> Av. Principal 1234, Lima, Perú</li>
        </ul>
        <p>También puedes seguirnos en nuestras redes sociales o dejarnos un mensaje a través del formulario en la página de inicio.</p>
      </div>
    </div>
  );
}
