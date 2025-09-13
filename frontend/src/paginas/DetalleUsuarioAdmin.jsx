import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../estilos/DetalleUsuarioAdmin.css';
import SidebarAdmin from "../componentes/SidebarAdmin";

const DetalleUsuarioAdmin = () => {
  const { id } = useParams();
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    if (!usuario || !usuario.id_usuario || usuario.rol !== "admin") return;

    const fetchDetalle = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/usuario-admin/${id}`, {
          headers: {
            id_usuario: usuario.id_usuario,
            rol: usuario.rol
          }
        });
        const data = await res.json();
        setDetalle(data);
      } catch (error) {
        console.error('Error al obtener detalle:', error);
      }
    };

    fetchDetalle();
  }, [id, usuario]);

  if (!detalle) return <p className="detalle-loading">Cargando datos del usuario...</p>;

  const { usuario: user, ordenes } = detalle;

  return (
    <div className="detalle-usuario-admin">
      <SidebarAdmin />
      <h2>Detalle del Usuario</h2>

      <div className="datos-usuario">
        <p><strong>ID:</strong> {user.id_usuario}</p>
        <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
        <p><strong>Correo:</strong> {user.correo}</p>
        <p><strong>Estado:</strong> {user.activo ? 'Activo' : 'Inactivo'}</p>
        <p><strong>Fecha Registro:</strong> {new Date(user.fecha_registro).toLocaleDateString()}</p>
      </div>

      <h3>Últimas Órdenes</h3>
      {ordenes.length === 0 ? (
        <p>Este usuario no tiene órdenes registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID Orden</th>
              <th>Fecha</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(o => (
              <tr key={o.id_orden}>
                <td>{o.id_orden}</td>
                <td>{new Date(o.fecha).toLocaleDateString()}</td>
                <td>S/ {parseFloat(o.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="volver-btn" onClick={() => navigate('/admin/usuarios')}>
        ← Volver al listado
      </button>
    </div>
  );
};

export default DetalleUsuarioAdmin;
