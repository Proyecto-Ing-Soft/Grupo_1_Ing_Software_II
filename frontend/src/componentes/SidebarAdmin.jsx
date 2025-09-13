import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import "../estilos/SidebarAdmin.css";

const opcionesSidebar = [
  { nombre: "Dashboard", ruta: "/admin/dashboard", icono: "/src/assets/dashboard/icon-dashboard.png" },
  { nombre: "Productos", ruta: "/admin/productos", icono: "/src/assets/dashboard/icon-productos.png" },
  { nombre: "Órdenes", ruta: "/admin/ordenes", icono: "/src/assets/dashboard/icon-ordenes.png" },
  { nombre: "Usuarios", ruta: "/admin/usuarios", icono: "/src/assets/dashboard/icon-usuarios.png" },
  { nombre: "Categorías", ruta: "/admin/categorias", icono: "/src/assets/dashboard/icon-categorias.png" },
];

export default function SidebarAdmin({ defaultOpen = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultOpen);

  const location = useLocation();

  if (location.pathname === "/admin/dashboard") return null;

  return (
    <>
        <AnimatePresence>
        {sidebarOpen && (
            <motion.aside
            className="admin-dashboard-sidebar"
            initial={{ x: -220, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -220, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
            >
            <img src="/src/assets/branding/logo-blanco.png" alt="Logo" className="sidebar-logo" />
            <nav>
                {opcionesSidebar.map((op) => (
                <Link key={op.nombre} to={op.ruta} className="sidebar-link">
                    <img src={op.icono} alt={op.nombre} />
                    <span>{op.nombre}</span>
                </Link>
                ))}
            </nav>
            <img src="/src/assets/dashboard/sidebar-futbol.png" className="sidebar-bg" alt="" />
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
            </motion.aside>
        )}
        </AnimatePresence>
        {!sidebarOpen && (
        <button
            className="sidebar-open-btn"
            onClick={() => setSidebarOpen(true)}
            style={{
            position: 'fixed',
            top: 100,
            left: 18,
            zIndex: 150,
            }}
            aria-label="Abrir menú"
        >
            ☰
        </button>
        )}
    </>
    );

}
