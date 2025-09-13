import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import '../estilos/CambiarPassword.css';
import { cambiarPassword } from '../servicios/apiUsuario';

export default function CambiarPassword() {
  const { usuario } = useContext(UserContext);
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const cambiar = async (e) => {
    e.preventDefault();

    if (!usuario || !usuario.id_usuario) {
      setMensaje('Usuario no autenticado');
      return;
    }

    if (!nueva || !confirmar) {
      setMensaje('Completa ambos campos');
      return;
    }

    if (nueva !== confirmar) {
      setMensaje('Las contraseñas no coinciden');
      return;
    }

    const respuesta = await cambiarPassword(usuario.id_usuario, nueva);
    if (respuesta.success) {
      setMensaje('Contraseña actualizada exitosamente');
      setNueva('');
      setConfirmar('');
    } else {
      setMensaje(respuesta.mensaje);
    }
  };

  if (loading) {
    return <div className="cambiar-container"><p className="cambiar-mensaje">Cargando usuario...</p></div>;
  }

  return (
    <div className="cambiar-container">
      <form onSubmit={cambiar} className="cambiar-form">
        <h2>Cambiar Contraseña</h2>
        {mensaje && <div className="cambiar-mensaje">{mensaje}</div>}
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
}
