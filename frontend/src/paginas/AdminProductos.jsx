import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  obtenerProductos,
  cambiarEstadoProducto
} from "../servicios/apiProductos";
import { UserContext } from "../context/UserContext";
import "../estilos/AdminProductos.css";
import SidebarAdmin from "../componentes/SidebarAdmin";

export default function AdminProductos() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 50;
  const { usuario } = useContext(UserContext);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const res = await obtenerProductos();
      setProductos(Array.isArray(res) ? res : []);
    } catch {
      setProductos([]);
    }
    setCargando(false);
  };

  const handleCambiarEstado = async (e, idProducto) => {
    e.preventDefault();

    const index = productos.findIndex(p => p.id_producto === idProducto);
    if (index === -1) return;

    const productoOriginal = productos[index];

    const nuevosProductos = [...productos];
    nuevosProductos[index] = { ...productoOriginal, activo: !productoOriginal.activo };
    setProductos(nuevosProductos);

    try {
      await cambiarEstadoProducto(idProducto, usuario);
    } catch (error) {
      nuevosProductos[index] = productoOriginal;
      setProductos(nuevosProductos);
      alert("Error al cambiar estado del producto.");
    }
  };

  const opcionesSidebar = [
    { nombre: "Dashboard", ruta: "/admin/dashboard", icono: "/src/assets/dashboard/icon-dashboard.png" },
    { nombre: "Productos", ruta: "/admin/productos", icono: "/src/assets/dashboard/icon-productos.png" },
    { nombre: "Órdenes", ruta: "/admin/ordenes", icono: "/src/assets/dashboard/icon-ordenes.png" },
    { nombre: "Usuarios", ruta: "/admin/usuarios", icono: "/src/assets/dashboard/icon-usuarios.png" },
  ];

  const productosFiltrados = productos.filter(
    p =>
      p.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.CAMISETum?.descripcion_camiseta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.id_producto + "").includes(busqueda)
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className="admin-productos-bg">
      <SidebarAdmin />
      <div className="admin-productos-overlay">
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="admin-productos-header"
        >
          <h1>Gestión de Productos</h1>
          <p>Administra camisetas, stock, tallas y más</p>
        </motion.header>
        <div className="admin-productos-bar">
          <input
            type="text"
            className="admin-productos-buscar"
            placeholder="Buscar producto, SKU o ID..."
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
          <Link to="/admin/productos/agregar" className="admin-productos-agregar-btn">
            <img src="/src/assets/dashboard/icon-agregar.png" alt="Agregar" />
            Agregar Producto
          </Link>
        </div>
        <motion.div
          className="admin-productos-lista"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 40 },
            show: { opacity: 1, y: 0, transition: { staggerChildren: 0.10, delayChildren: 0.1 } }
          }}
        >
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>SKU</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Editar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={8}><span className="cargando">Cargando...</span></td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8}><span className="no-productos">No hay productos</span></td>
                </tr>
              ) : (
                productosPaginados.map((p) => (
                  <motion.tr key={p.id_producto} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <td>{p.id_producto}</td>
                    <td>
                      <img src={p.CAMISETum?.imagen_url || "/src/assets/dashboard/icon-productos.png"} alt="Camiseta" className="producto-imagen-mini" />
                    </td>
                    <td>{p.sku}</td>
                    <td>{p.CAMISETum?.descripcion_camiseta}</td>
                    <td>S/ {Number(p.precio).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <Link to={`/admin/productos/editar/${p.id_producto}`} className="btn-editar">
                        <img src="/src/assets/dashboard/icon-editar.png" alt="Editar" />
                        Editar
                      </Link>
                    </td>
                    <td>
                      <button
                          className="btn-eliminar"
                          onClick={(e) => handleCambiarEstado(e, p.id_producto)}
                        >
                        <img src="/src/assets/dashboard/icon-eliminar.jpg" alt="Cambiar estado" />
                        {p.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem", gap: "10px" }}>
            <button
              onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
              style={{ padding: "7px 18px", borderRadius: "7px", color: "#222" , border: "1px solid #bbb", background: "#f3f3f3", cursor: paginaActual === 1 ? "not-allowed" : "pointer" }}
            >
              {"<"} Anterior
            </button>
            <span>Página {paginaActual} de {totalPaginas}</span>
            <button
              onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              style={{ padding: "7px 18px", borderRadius: "7px", color: "#222" , border: "1px solid #bbb", background: "#f3f3f3", cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer" }}
            >
              Siguiente {">"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
