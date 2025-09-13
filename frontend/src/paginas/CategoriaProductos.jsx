import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { obtenerProductos } from '../servicios/apiProductos';
import '../estilos/CategoriaProductos.css';
import CamisetaCard from '../componentes/CamisetaCard';

const opcionesOrden = [
  { value: '', label: 'Sin orden' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'nombre_asc', label: 'Nombre: A-Z' },
  { value: 'nombre_desc', label: 'Nombre: Z-A' },
];

export default function CategoriaProductos() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orden, setOrden] = useState('');

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerProductos();
        const filtrados = data
          .filter((p) => String(p?.CAMISETum?.CATEGORIum?.id_categoria) === String(id))
          .slice(0, 100); 
        setProductos(filtrados);
      } catch (err) {
        setError('Error al cargar productos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [id]);

  const ordenarProductos = (lista, criterio) => {
    switch (criterio) {
      case 'precio_desc':
        return [...lista].sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
      case 'precio_asc':
        return [...lista].sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
      case 'nombre_asc':
        return [...lista].sort((a, b) =>
          a.CAMISETum?.descripcion_camiseta?.localeCompare(b.CAMISETum?.descripcion_camiseta)
        );
      case 'nombre_desc':
        return [...lista].sort((a, b) =>
          b.CAMISETum?.descripcion_camiseta?.localeCompare(a.CAMISETum?.descripcion_camiseta)
        );
      default:
        return lista;
    }
  };

  const productosOrdenados = ordenarProductos(productos, orden);

  return (
    <div className="contenedor-principal" style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
      <div style={{ minWidth: 220 }}>
        <h3>Ordenar por</h3>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 8 }}
        >
          {opcionesOrden.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <h2>Productos de la categoría</h2>
        {loading && <p>Cargando productos...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="grid-camisetas">
          {!loading && !error && productosOrdenados.length > 0 ? (
            productosOrdenados.map((item) => (
              <CamisetaCard
                key={item.id_producto}
                id={item.id_producto}
                club={item.CAMISETum?.descripcion_camiseta || 'Sin nombre'}
                precio={item.precio}
                img={item.CAMISETum?.imagen_url}
              />
            ))
          ) : (
            !loading &&
            !error && <p>No hay productos disponibles en esta categoría.</p>
          )}
        </div>
      </div>
    </div>
  );
}