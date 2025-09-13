import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { obtenerDatosUsuario, actualizarDatosUsuario } from '../servicios/apiUsuario';
import '../estilos/EditarPerfil.css';

export default function DatosUsuario() {
  const { usuario } = useContext(UserContext);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (usuario?.id_usuario) {
      const cargarDatos = async () => {
        const res = await obtenerDatosUsuario(usuario.id_usuario);
        if (res.success) {
          setNombre(res.data.nombre);
          setApellido(res.data.apellido);
          setCorreo(res.data.correo);
        } else {
          setMensaje(res.mensaje);
        }
      };
      cargarDatos();
    }
  }, [usuario]);

  const guardar = async (e) => {
    e.preventDefault();

    const res = await actualizarDatosUsuario(usuario.id_usuario, nombre, apellido, correo);
    if (res.success) {
      setMensaje('Datos actualizados correctamente');
    } else {
      setMensaje(res.mensaje);
    }
  };

  return (
    <div className="perfil-container">
      <form onSubmit={guardar} className="perfil-form">
        <h2>Editar Perfil</h2>
        {mensaje && <div className="perfil-mensaje">{mensaje}</div>}

        <label>Nombre:</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label>Apellido:</label>
        <input value={apellido} onChange={(e) => setApellido(e.target.value)} />

        <label>Correo:</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />

        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}
