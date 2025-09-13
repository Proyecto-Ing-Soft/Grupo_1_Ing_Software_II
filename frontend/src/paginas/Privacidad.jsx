import '../estilos/ContenidoLegal.css';

export default function Privacidad() {
  return (
    <div className="contenido-legal-container">
      <div className="contenido-box">
        <h2>Política de Privacidad</h2>
        <p>En Tienda Gepeto nos comprometemos a proteger tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tus datos personales:</p>
        <ul>
          <li>No compartimos tu información personal con terceros sin tu consentimiento.</li>
          <li>La información se utiliza únicamente para procesar pedidos y mejorar tu experiencia.</li>
          <li>Aplicamos medidas de seguridad para proteger tus datos.</li>
          <li>Puedes solicitar la modificación o eliminación de tus datos en cualquier momento.</li>
          <li>Usamos cookies solo para mejorar la navegación y estadísticas del sitio.</li>
        </ul>
      </div>
    </div>
  );
}
