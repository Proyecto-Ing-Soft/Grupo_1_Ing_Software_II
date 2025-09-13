import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../estilos/ResultadosBusqueda.css';
import CamisetaCard from '../componentes/CamisetaCard';
import { buscarProductos } from '../servicios/apiProductos';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResultadosBusqueda() {
  const query = useQuery();
  const termino = query.get('q')?.toLowerCase() || '';
  const [productos, setProductos] = useState([]);
  const [orden, setOrden] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      if (termino.trim() === '') {
        setProductos([]);
        setCargando(false);
        return;
      }

      setCargando(true);
      try {
        const data = await buscarProductos(termino, 'nombre'); // Siempre usar orden base
        setProductos(data);
      } catch (error) {
        console.error('Error al buscar productos:', error);
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };

    buscar();
  }, [termino]); // Solo depender del término de búsqueda

  // Función para ordenar productos localmente
  const ordenarProductos = (lista, tipoOrden) => {
    if (!tipoOrden) return lista;

    return [...lista].sort((a, b) => {
      const esGrupoA = a.esGrupo || (a.descripcion_camiseta && !a.CAMISETum);
      const esGrupoB = b.esGrupo || (b.descripcion_camiseta && !b.CAMISETum);
      
      const nombreA = esGrupoA ? a.descripcion_camiseta : a.CAMISETum?.descripcion_camiseta || '';
      const nombreB = esGrupoB ? b.descripcion_camiseta : b.CAMISETum?.descripcion_camiseta || '';
      
      const precioA = parseFloat(a.precio || 0);
      const precioB = parseFloat(b.precio || 0);

      switch (tipoOrden) {
        case 'precio_desc':
          return precioB - precioA;
        case 'precio_asc':
          return precioA - precioB;
        case 'nombre_asc':
          return nombreA.localeCompare(nombreB);
        case 'nombre_desc':
          return nombreB.localeCompare(nombreA);
        default:
          return 0;
      }
    });
  };

  const productosOrdenados = ordenarProductos(productos, orden);

  return (
    <div className="resultados-container">
      <h2>Resultados para: "{termino}"</h2>

      <div className="filtros-busqueda">
        <label>Ordenar por:</label>
        <select value={orden} onChange={e => setOrden(e.target.value)}>
          <option value="">Sin orden</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="nombre_asc">Nombre: A-Z</option>
          <option value="nombre_desc">Nombre: Z-A</option>
        </select>
      </div>

      {cargando ? (
        <div className="cargando-container">
          <p>🔍 Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="no-resultados">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <p>Intenta con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid-camisetas">
          {productosOrdenados.map((item) => {
            // Verificar si es un producto agrupado
            const esGrupo = item.esGrupo || (item.descripcion_camiseta && !item.CAMISETum);
            
            return (
              <CamisetaCard
                key={esGrupo ? `grupo-${item.id_camiseta || item.id_producto}` : item.id_producto}
                id={item.id_producto}
                club={esGrupo ? item.descripcion_camiseta : item.CAMISETum?.descripcion_camiseta}
                precio={item.precio}
                img={esGrupo ? item.imagen_url : item.CAMISETum?.imagen_url}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
