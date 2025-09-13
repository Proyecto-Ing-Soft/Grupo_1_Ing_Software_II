import { Link } from 'react-router-dom';
import '../estilos/Footer.css';
import '../estilos/index.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">Inicio</Link>
        <Link to="/terminos">Términos</Link>
        <Link to="/privacidad">Privacidad</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
      <div className="footer-social">
        <span>Síguenos:</span>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
      </div>
      <div className="footer-copy">
        © 2025 Grupo1. Todos los derechos reservados.
      </div>
    </footer>
  );
}
