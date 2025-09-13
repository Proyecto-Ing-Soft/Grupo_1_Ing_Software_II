import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../estilos/ListaUsuariosAdmin.css';
import SidebarAdmin from "../componentes/SidebarAdmin";

const ListaUsuariosAdmin = () => {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!usuario || !usuario.id_usuario || usuario.rol !== "admin") return;

    const fetchUsuarios = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/usuario-admin?filtro=${filtro}`, {
          headers: {
            id_usuario: usuario.id_usuario,
            rol: usuario.rol
          }
        });

        if (!res.ok) {
          console.error("Error de autenticación");
          return;
        }

        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };

    fetchUsuarios();
  }, [filtro, usuario]);

  const cambiarEstado = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuario-admin/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          id_usuario: usuario.id_usuario,
          rol: usuario.rol
        }
      });
      const data = await res.json();
      alert(data.mensaje);
      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuario === id ? { ...u, activo: !u.activo } : u))
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  return (
    <div className="lista-usuarios-admin">
      <SidebarAdmin />

      <h2>Usuarios Registrados</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o apellido"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr><td colSpan="5">No hay usuarios disponibles.</td></tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id_usuario}>
                <td>{u.id_usuario}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.correo}</td>
                <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <button onClick={() => navigate(`/admin/usuarios/${u.id_usuario}`)}>Ver Detalle</button>
                  <button onClick={() => cambiarEstado(u.id_usuario)}>
                    {u.activo ? 'Desactivar' : 'Activar'}
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

export default ListaUsuariosAdmin;
