import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { crearCategoria } from '../servicios/apiCategorias';
import '../estilos/AgregarCategoria.css';
import SidebarAdmin from "../componentes/SidebarAdmin";

export default function AgregarCategoria() {
  const [nombre, setNombre] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);

  if (!usuario) return <p>Cargando usuario...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !imagenUrl.trim()) {
      setMensaje('Por favor completa todos los campos');
      return;
    }

    try {
      await crearCategoria({
        nombre_categoria: nombre.trim(),
        imagen_url: imagenUrl.trim(),
        id_usuario: usuario.id_usuario,
        rol: usuario.rol
      });

      setMensaje('Categoría agregada con éxito');
      setNombre('');
      setImagenUrl('');
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <div className="agregar-categoria-container">
      <form className="agregar-categoria-form" onSubmit={handleSubmit}>
        <h2>Agregar Nueva Categoría</h2>
        {mensaje && <div className="mensaje-categoria">{mensaje}</div>}

        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="text"
          placeholder="URL de la imagen"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
        />

        <button type="submit">Guardar Categoría</button>
      </form>

      <button
        className="btn-volver-inicio"
        onClick={() => navigate('/admin/categorias')}
      >
        ⬅ Volver al Listado
      </button>
    </div>
  );
}
