import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import "../estilos/AdminDashboard.css";
import { obtenerKPIs } from "../servicios/apiDashboard";


const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value || 0;
    if (start === end) return;

    let current = start;
    let increment = 1;

    const getIncrement = (val) => {
      if (val < 10) return 1;
      if (val < 100) return 10;
      if (val < 1000) return 100;
      if (val < 10000) return 1000;
      if (val < 100000) return 10000;
      return 100000;
    };

    const duration = 3000; 
    const steps = Math.ceil(Math.log10(end + 1) * 20); 
    const stepTime = Math.max(Math.floor(duration / steps), 15);

    const timer = setInterval(() => {
      increment = getIncrement(Math.abs(end - current));
      if (current < end) {
        current = Math.min(current + increment, end);
      } else if (current > end) {
        current = Math.max(current - increment, end);
      }
      setDisplay(current);

      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
};

export default function AdminDashboard() {
    const [kpis, setKpis] = useState({
    productos: 0,
    stock: 0,
    usuarios: 0,
    ordenes: 0,
  });

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const data = await obtenerKPIs();
        setKpis(data);
      } catch (err) {
      }
    }
    fetchKPIs();
  }, []);

  const opciones = [
    {
      nombre: "Productos",
      ruta: "/admin/productos",
      color: "#E91E63",
      descripcion: "Administra camisetas y detalles",
      fondo: "/src/assets/dashboard/bg-productos.png"
    },
    {
      nombre: "Órdenes",
      ruta: "/admin/ordenes",
      color: "#009688",
      descripcion: "Revisa y administra pedidos",
      fondo: "/src/assets/dashboard/bg-ordenes.png"
    },
    {
      nombre: "Usuarios",
      ruta: "/admin/usuarios",
      color: "#FF9800",
      descripcion: "Edita datos y permisos de usuarios",
      fondo: "/src/assets/dashboard/bg-usuarios.png"
    },
    {
      nombre: "Categorías",
      ruta: "/admin/categorias",
      color: "#3F51B5",
      descripcion: "Gestiona categorías de productos",
      fondo: "/src/assets/dashboard/bg-categorias.png"
    }
  ];


    const metricas = [
    {
      nombre: "Stock total",
      valor: kpis.stock,
      icono: "/src/assets/dashboard/icon-stock.png",
      color: "#43a047"
    },
    {
      nombre: "Productos",
      valor: kpis.productos,
      icono: "/src/assets/dashboard/icon-productos.png",
      color: "#E91E63"
    },
    {
      nombre: "Órdenes",
      valor: kpis.ordenes,
      icono: "/src/assets/dashboard/icon-ordenes.png",
      color: "#009688"
    },
    {
      nombre: "Usuarios",
      valor: kpis.usuarios,
      icono: "/src/assets/dashboard/icon-usuarios.png",
      color: "#FF9800"
    }
  ];


  return (
    <div className="admin-dashboard-bg">

      <div className="admin-dashboard-overlay">
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="admin-dashboard-header"
        >
          <img src="/src/assets/branding/logo-banner.png" alt="Logo" className="admin-dashboard-logo" />
          <h1>Panel de Administración</h1>
          <p className="admin-dashboard-sub">Control total sobre inventario, ventas y operaciones</p>
        </motion.header>

        <motion.div
          className="admin-dashboard-metricas"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 40 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.18,
                delayChildren: 0.35
              }
            }
          }}
        >
          {metricas.map((m, idx) => (
            <motion.div
              key={m.nombre}
              className="admin-dashboard-metrica-card"
              style={{ borderColor: m.color }}
              whileHover={{ scale: 1.05, boxShadow: `0 4px 16px 0 ${m.color}33` }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
            >
              <img src={m.icono} alt={m.nombre} />
              <div>
                <span style={{ color: m.color }}>
                  <AnimatedNumber value={m.valor} />
                </span>
                <p>{m.nombre}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="admin-dashboard-cards"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 50 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.13,
                delayChildren: 0.5
              }
            }
          }}
        >
          {opciones.map((op, idx) => (
            <motion.div
                key={op.nombre}
                className="admin-dashboard-card"
                whileHover={{ scale: 1.08, boxShadow: `0 4px 24px 0 ${op.color}33` }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                style={{
                backgroundImage: `url(${op.fondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
                }}
            >
                <Link to={op.ruta} className="admin-dashboard-link">
                <div className="admin-dashboard-card-content">
                    <h2 style={{ color: op.color }}>{op.nombre}</h2>
                    <p>{op.descripcion}</p>
                </div>
                </Link>
            </motion.div>
            ))}
        </motion.div>
      </div>
    </div>
  );
}
