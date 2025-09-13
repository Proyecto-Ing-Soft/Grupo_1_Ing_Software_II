import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../estilos/ListaOrdenesAdmin.css';
import SidebarAdmin from "../componentes/SidebarAdmin";

const ListaOrdenesAdmin = () => {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!usuario || !usuario.id_usuario || usuario.rol !== "admin") return;

    const fetchOrdenes = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/orden-admin?filtro=${filtro}`, {
          headers: {
            id_usuario: usuario.id_usuario,
            rol: usuario.rol
          }
        });
        const data = await res.json();
        setOrdenes(data);
      } catch (error) {
        console.error('Error al obtener órdenes:', error);
      }
    };

    fetchOrdenes();
  }, [filtro, usuario]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="lista-ordenes-admin">
      <SidebarAdmin />

      <h2>Órdenes Registradas</h2>
      <input
        type="text"
        placeholder="Buscar por nombre, apellido o ID de orden"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length === 0 ? (
            <tr><td colSpan="6">No hay órdenes.</td></tr>
          ) : (
            ordenes.map((o) => (
              <tr key={o.id_orden}>
                <td data-label="ID">{o.id_orden}</td>
                <td data-label="Cliente">{o.USUARIO?.nombre} {o.USUARIO?.apellido}</td>
                <td data-label="Fecha">{formatearFecha(o.fecha)}</td>
                <td data-label="Total">S/ {parseFloat(o.total).toFixed(2)}</td>
                <td data-label="Estado">{o.ESTADO_ORDEN?.nombre_estado}</td>
                <td data-label="Acciones">
                  <button onClick={() => navigate(`/admin/ordenes/${o.id_orden}`)}>
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListaOrdenesAdmin;
