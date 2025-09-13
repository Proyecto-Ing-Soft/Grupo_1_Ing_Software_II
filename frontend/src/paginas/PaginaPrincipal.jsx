import React, { useEffect, useState } from 'react';
import '../estilos/PaginaPrincipal.css';
import '../estilos/index.css';
import CamisetaCard from '../componentes/CamisetaCard';
import CategoriaCard from '../componentes/CategoriaCard';
import BannerCarousel from '../componentes/BannerCarousel';
import { obtenerProductosDestacados, obtenerProductosNuevos } from '../servicios/apiProductos';
import { obtenerCategorias } from '../servicios/apiCategorias';

export default function PaginaPrincipal() {
  const [categorias, setCategorias] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [productosNuevos, setProductosNuevos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, top, nuevos] = await Promise.all([
          obtenerCategorias(),
          obtenerProductosDestacados(),
          obtenerProductosNuevos()
        ]);

        setCategorias(Array.isArray(cats) ? cats : []);
        setProductosTop(Array.isArray(top) ? top : []);
        setProductosNuevos(Array.isArray(nuevos) ? nuevos : []);
      } catch (err) {
        setError(err.message || 'Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const categoriasDestacadas = categorias.slice(0, 4);

  if (loading) return <p className="loading">Cargando tienda...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="pagina-principal">
      <BannerCarousel />

      <section className="explora-categorias seccion-contenido">
        <h2 className="titulo-explorar-categoria">Categorías destacadas</h2>
        <div className="categorias-grid">
          {categoriasDestacadas.map((cat) => (
            <CategoriaCard
              key={cat.id_categoria}
              nombre={cat.nombre_categoria}
              imagen={cat.imagen_url}
              ruta={`/categoria/${cat.id_categoria}`}
            />
          ))}
        </div>
      </section>

      <section className="seccion-contenido">
        <h2 className="titulo-seccion">Top 10 camisetas destacadas</h2>
        <div className="grid-camisetas">
          {productosTop.map((item) => {
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
      </section>

      <section className="seccion-contenido">
        <h2 className="titulo-seccion">Novedades</h2>
        <div className="grid-camisetas">
          {productosNuevos.map((item) => {
            // Verificar si es un producto agrupado
            const esGrupo = item.esGrupo || (item.descripcion_camiseta && !item.CAMISETum);
            
            return (
              <CamisetaCard
                key={esGrupo ? `grupo-${item.id_camiseta || item.id_producto}` : item.id_producto}
                id={item.id_producto}
                club={esGrupo ? item.descripcion_camiseta : (item.CAMISETum?.descripcion_camiseta || 'Producto')}
                precio={item.precio}
                img={esGrupo ? item.imagen_url : (item.CAMISETum?.imagen_url || '/img/default.png')}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
