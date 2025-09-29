// src/componentes/LayoutProtegido.tsx
import { Outlet } from "react-router-dom";
import BotonCerrarSesion from "./BotonCerrarSesion";
import "../estilos/LayoutProtegido.css";

export default function LayoutProtegido() {
  return (
    <div className="lp__wrap">
      <header className="lp__topbar">
        <div className="lp__brand">
          <span className="lp__logo">🔨</span>
          <span className="lp__title">LlantApp</span>
        </div>
        <div className="lp__actions">
          {/* Aquí puedes añadir más acciones comunes si quieres */}
          <BotonCerrarSesion className="btn-secondary" />
        </div>
      </header>

      <main className="lp__main">
        {/* Las páginas protegidas se renderizan aquí */}
        <Outlet />
      </main>
    </div>
  );
}
