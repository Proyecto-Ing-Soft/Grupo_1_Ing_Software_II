import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCategorias } from '../servicios/apiCategorias';
import '../estilos/ListadoCategoriasAdmin.css';
import SidebarAdmin from "../componentes/SidebarAdmin";

export default function ListadoCategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await obtenerCategorias();
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener categorías:', error.message);
      }
    };
    cargarCategorias();
  }, []);

  return (
    <div className="categorias-admin-container">
    <SidebarAdmin defaultOpen={false} />
      <h2>Categorías disponibles</h2>

      <div className="categorias-grid">
        {categorias.length === 0 ? (
          <p>No hay categorías registradas.</p>
        ) : (
          categorias.map((cat) => (
            <div
              key={cat.id_categoria}
              className="categoria-card"
              onClick={() => navigate(`/categoria/${cat.id_categoria}`)}
              style={{ cursor: 'pointer' }}
            >
              <img src={cat.imagen_url} alt={cat.nombre_categoria} />
              <p>{cat.nombre_categoria}</p>
            </div>
          ))
        )}
      </div>

      <button
        className="btn-agregar-categoria"
        onClick={() => navigate('/admin/agregar-categoria')}
      >
        ➕ Agregar Categoría
      </button>
    </div>
  );
}
