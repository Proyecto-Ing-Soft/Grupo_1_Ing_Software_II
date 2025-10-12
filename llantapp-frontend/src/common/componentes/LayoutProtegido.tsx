import { Outlet, Link } from "react-router-dom";
import BotonCerrarSesion from "./BotonCerrarSesion";
import "../estilos/LayoutProtegido.css";

export default function LayoutProtegido() {
  return (
    <div className="lp__wrap">
      <header className="lp__topbar">
        {/* Hacemos clickeable toda la marca */}
        <Link to="/inicio" className="lp__brand" aria-label="Ir al inicio">
          <span className="lp__logo">🔨</span>
          <span className="lp__title">LlantApp</span>
        </Link>

        <div className="lp__actions">
          <BotonCerrarSesion className="logout-btn" />
        </div>
      </header>

      <main className="lp__main">
        <Outlet />
      </main>
    </div>
  );
}
