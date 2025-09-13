import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../estilos/MiPerfil.css';

export default function ListaOrdenes() {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (usuario === null) return;

    if (!usuario?.id_usuario || usuario.id_rol === 1) {
      setMensaje('Acceso no autorizado');
      return;
    }

    const cargarOrdenes = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/orden/usuario/${usuario.id_usuario}`, {
          headers: { id_usuario: usuario.id_usuario }
        });

        const data = await res.json();
        if (res.ok && data.length > 0) {
          setOrdenes(data);
        } else {
          setMensaje('No tienes órdenes registradas');
        }
      } catch {
        setMensaje('Error al obtener órdenes');
      }
    };

    cargarOrdenes();
  }, [usuario]);

  return (
    <>
      <div className="lista-ordenes-container">
        <h2>📋 Mis Órdenes</h2>
        {mensaje ? (
          <div className="mensaje-vacio">
            <p>{mensaje}</p>
            <button className="btn-volver" onClick={() => navigate('/')}>Volver al inicio</button>
          </div>
        ) : (
          <table className="tabla-ordenes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id_orden}>
                  <td>{orden.id_orden}</td>
                  <td>{new Date(orden.fecha).toLocaleString()}</td>
                  <td>S/ {orden.total}</td>
                  <td>{orden.ESTADO_ORDEN?.nombre_estado}</td>
                  <td>
                    <button
                      className="btn-detalle"
                      onClick={() => navigate(`/usuario/orden/${orden.id_orden}`)}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="boton-editar-perfil-container">
        <button className="btn-editar-perfil" onClick={() => navigate('/usuario/datos')}>
          ✏️ Editar Perfil
        </button>
      </div>
    </>
  );
}
