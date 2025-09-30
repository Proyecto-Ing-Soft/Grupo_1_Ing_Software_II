// src/paginas/InicioProtegido.tsx

import { Link } from "react-router-dom";
import { useAuth } from "../app/proveedorestado/AuthContext";
import "../estilos/inicioProtegido.css";

export default function InicioProtegido() {
  const { sesion, tieneRol } = useAuth();

  /**
   * Principios y patrones aplicados aquí:
   * - KISS: mantenemos la lógica simple; solo usamos AuthContext.
   * - Ley de Demeter: el componente consulta a AuthContext (su “amigo”), sin acceder a JWT directamente.
   * - Cohesión alta: solo se encarga de renderizar UI de inicio.
   * - Facade: AuthContext oculta complejidad de sesión, refresco y perfil.
   */

  return (
    <div className="inicio-container">
      {/* Encabezado con nombre + rol */}
      <header className="inicio-header">
        <h1>Inicio</h1>
        {sesion.perfil && (
          <span className={`rol-badge rol-${sesion.perfil.rol.toLowerCase()}`}>
            🚗 {sesion.perfil.nombreCompleto} | Rol: {sesion.perfil.rol}
          </span>
        )}
      </header>

      {/* Card con las acciones disponibles */}
      <div className="card">
        <h2>Acciones</h2>
        <div className="acciones">
          {/* Botón solo visible para ADMIN y MECÁNICO */}
          {tieneRol(["ADMIN", "MECANICO"]) && (
            <Link to="/vehiculos/registrar" className="btn-primary">
              Registrar vehículo
            </Link>
          )}

          {/* Botones para chofer/empresa */}
          {tieneRol(["CHOFER", "EMPRESA"]) && (
            <Link to="/citas/agendar" className="btn-primary">
              Agendar cita
            </Link>
          )}

          {tieneRol(["CHOFER", "EMPRESA"]) && (
            <Link to="/citas/mias" className="btn-secondary">
              Mis citas
            </Link>
          )}

          {/* Botón exclusivo del mecánico */}
          {tieneRol(["MECANICO"]) && (
            <Link to="/citas/asignadas" className="btn-secondary">
              Citas asignadas
            </Link>
          )}

          {/* Todos los roles pueden ver sus notificaciones */}
          {tieneRol(["CHOFER", "EMPRESA", "MECANICO"]) && (
            <Link to="/notificaciones" className="btn-secondary">
              Mis notificaciones
            </Link>
          )}

          {tieneRol(["ADMIN"]) && (
          <Link to="/admin/citas-pendientes" className="btn-primary">
            Citas pendientes
          </Link>
          )}
        </div>
      </div>
    </div>
  );
}
