import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { obtenerCategorias } from '../servicios/apiCategorias';
import { CarritoContexto } from '../context/CarritoContexto';
import logoBanner from '../assets/branding/logo-banner-topbar.png';
import '../estilos/TopBar.css';
import '../estilos/index.css';

export default function TopBar() {
  const navigate = useNavigate();
  const { usuario, logout } = useContext(UserContext);
  const { totalCarrito, limpiarCarrito } = useContext(CarritoContexto);
  const location = useLocation();
  const esAdminDashboard = location.pathname === "/admin/dashboard";
  const esRutaAdmin = location.pathname.startsWith("/admin") && !esAdminDashboard;


  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [termino, setTermino] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);

  const timeoutUsuarioRef = useRef(null);
  const timeoutCategoriasRef = useRef(null);

  const nombreUsuario = usuario?.nombre || usuario?.correo || "Usuario";
  const esAdmin = usuario?.rol === 'admin' || usuario?.id_rol === 2;

  useEffect(() => {
    setCatLoading(true);
    setCatError(null);
    obtenerCategorias()
      .then(data => setCategorias(data))
      .catch(err => setCatError(err.message))
      .finally(() => setCatLoading(false));
  }, []);

  const handleBuscar = (e) => {
    if (e.key === 'Enter' && termino.trim() !== '') {
      navigate(`/buscar?q=${encodeURIComponent(termino)}`);
      setTermino('');
    }
  };

  const abrirMenuUsuario = () => {
    clearTimeout(timeoutUsuarioRef.current);
    setMostrarMenuUsuario(true);
  };

  const cerrarMenuUsuario = () => {
    timeoutUsuarioRef.current = setTimeout(() => setMostrarMenuUsuario(false), 300);
  };

  const abrirMenuCategorias = () => {
    clearTimeout(timeoutCategoriasRef.current);
    setMostrarDropdown(true);
  };

  const cerrarMenuCategorias = () => {
    timeoutCategoriasRef.current = setTimeout(() => setMostrarDropdown(false), 300);
  };

  return (
    <div className="topbar">
      {esAdminDashboard ? (
        <>
          <div className="topbar-left">
          <span className="logo">Grupo 1</span>
            <Link to="/" className="topbar-btn">Inicio</Link>
          </div>
          <div className="topbar-center">
            <span className="titulo-header" style={{ color: "#fff", fontWeight: 600 }}>
              Bienvenido, {usuario?.nombre ? usuario.nombre : "Administrador"}
            </span>
          </div>
          <div className="topbar-right">
            <div
              className="dropdown-user"
              onMouseEnter={abrirMenuUsuario}
              onMouseLeave={cerrarMenuUsuario}
            >
              <button className="topbar-btn">👤 Perfil ⏷</button>
              {mostrarMenuUsuario && (
                <div className="dropdown-user-menu">
                  <button onClick={() => navigate('/usuario/ordenes')}>📦 Mi Perfil</button>
                  <button onClick={() => navigate('/usuario/datos')}>📝 Editar Perfil</button>
                  <button onClick={() => navigate('/usuario/password')}>🔒 Cambiar Contraseña</button>
                  <button onClick={() => {
                    logout();
                    limpiarCarrito();
                    navigate('/');
                  }}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : esRutaAdmin ? (
        <>
          <div className="topbar-left" style={{ flex: "0 0 auto" }}>
          <span className="logo">Grupo 1</span>
            <Link to="/" className="topbar-btn">Inicio</Link>
            <img
              src={logoBanner}
              alt="Logo Tienda"
              className="logo-banner"
              style={{
                height: '48px',
              }}
            />
          </div>
          <div className="topbar-center" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <span className="titulo-header" style={{ color: "#fff", fontWeight: 600 }}>
              Panel de Administrador
            </span>
          </div>
          <div className="topbar-right">
            <div
              className="dropdown-user"
              onMouseEnter={abrirMenuUsuario}
              onMouseLeave={cerrarMenuUsuario}
            >
              <button className="topbar-btn">👤 {nombreUsuario} ⏷</button>
              {mostrarMenuUsuario && (
                <div className="dropdown-user-menu">
                  <button onClick={() => navigate('/usuario/ordenes')}>📦 Mi Perfil</button>
                  <button onClick={() => navigate('/usuario/datos')}>📝 Editar Perfil</button>
                  <button onClick={() => navigate('/usuario/password')}>🔒 Cambiar Contraseña</button>
                  <button onClick={() => navigate('/admin/categorias')}>🗂️ Ver Categorías</button>
                  <button onClick={() => navigate('/admin/agregar-categoria')}>➕ Agregar Categoría</button>
                  <button onClick={() => {
                    logout();
                    limpiarCarrito();
                    navigate('/');
                  }}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="topbar-left">
            <span className="logo">Grupo 1</span>
            <Link to="/" className="topbar-btn">Inicio</Link>
            <div
              className="topbar-dropdown"
              onMouseEnter={abrirMenuCategorias}
              onMouseLeave={cerrarMenuCategorias}
            >
              <button className="topbar-btn">Categorías ⏷</button>
              {mostrarDropdown && (
                <div className="dropdown-menu">
                  {catLoading && <p className="dropdown-info">Cargando...</p>}
                  {catError && <p className="dropdown-error">Error: {catError}</p>}
                  {!catLoading && !catError && categorias.length > 0 ? (
                    categorias.map(cat => (
                      <button
                        key={cat.id_categoria}
                        className="dropdown-item"
                        onClick={() => navigate(`/categoria/${cat.id_categoria}`)}
                      >
                        {cat.icono_url && (
                          <img
                            src={cat.icono_url}
                            alt={cat.nombre_categoria}
                            className="categoria-icono"
                          />
                        )}
                        <span>{cat.nombre_categoria}</span>
                      </button>
                    ))
                  ) : (
                    <p className="dropdown-info">No hay categorías</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="topbar-center">
            <img
              src={logoBanner}
              alt="Logo Tienda"
              className="logo-banner"
              style={{
                height: '60px',
              }}
            />
          </div>
          <div className="topbar-right">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar camisetas..."
                className="search-input"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                onKeyDown={handleBuscar}
                style={{ paddingRight: '38px' }}
              />
              <button
                className="search-icon-btn"
                aria-label="Buscar"
                onClick={() => {
                  if (termino.trim() !== '') {
                    navigate(`/buscar?q=${encodeURIComponent(termino)}`);
                    setTermino('');
                  }
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7" stroke="#003366" strokeWidth="2" />
                  <line x1="15.2929" y1="15.7071" x2="20" y2="20.4142" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {esAdmin && (
              <button className="dashboard-admin-btn" onClick={() => navigate('/admin/dashboard')}>
                🛠️ Dashboard Admin
              </button>
            )}
            <button className="topbar-btn" onClick={() => navigate('/carrito')}>
              🛒 Carrito <span className="monto-carrito">S/ {totalCarrito.toFixed(2)}</span>
            </button>
            {usuario ? (
              <div
                className="dropdown-user"
                onMouseEnter={abrirMenuUsuario}
                onMouseLeave={cerrarMenuUsuario}
              >
                <button className="topbar-btn">👤 {nombreUsuario} ⏷</button>
                {mostrarMenuUsuario && (
                  <div className="dropdown-user-menu">
                    <button onClick={() => navigate('/usuario/ordenes')}>📦 Mi Perfil</button>
                    <button onClick={() => navigate('/usuario/datos')}>📝 Editar Perfil</button>
                    <button onClick={() => navigate('/usuario/password')}>🔒 Cambiar Contraseña</button>
                    {esAdmin && (
                      <>
                        <button onClick={() => navigate('/admin/categorias')}>🗂️ Ver Categorías</button>
                        <button onClick={() => navigate('/admin/agregar-categoria')}>➕ Agregar Categoría</button>
                      </>
                    )}
                    <button onClick={() => {
                      logout();
                      limpiarCarrito();
                      navigate('/');
                    }}>
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="topbar-btn" onClick={() => navigate('/login')}>
                  👤 Iniciar sesión
                </button>
                <button className="topbar-btn" onClick={() => navigate('/register')}>
                  Registrarse
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
