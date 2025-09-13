import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import fondoEstadio from '../assets/imagenes/fondoprincipal.png';
import '../estilos/DetalleProducto.css';
import { CarritoContexto } from "../context/CarritoContexto";

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { agregarAlCarrito } = useContext(CarritoContexto);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:3000/api/producto/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Producto no encontrado');
        return res.json();
      })
      .then((data) => {
        if (!data) throw new Error('Producto no encontrado');
        setProducto(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar producto:", error);
        setError("Producto no encontrado");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <h2 className="detalle-cargando">Cargando...</h2>;
  if (error) return <h2 className="detalle-error">{error}</h2>;
  if (!producto) return <h2 className="detalle-error">Producto no encontrado</h2>;

  return (
    <div
      className="fondo-estadio"
      style={{ backgroundImage: `url(${fondoEstadio})` }}
    >
      <div className="detalle-container">
        <div className="detalle-card">
          <img
            src={producto.CAMISETum?.imagen_url || ''}
            alt={producto.CAMISETum?.descripcion_camiseta}
            className="detalle-imagen"
          />
          <div className="detalle-info">
            <h2>{producto.CAMISETum?.descripcion_camiseta}</h2>
            <p className="detalle-desc">
              Camiseta oficial. Tallas: S, M, L, XL. Género: {producto.GENERO?.descripcion_genero}
            </p>
            <p className="detalle-precio">S/ {parseFloat(producto.precio || 0).toFixed(2)}</p>
            <p className="detalle-stock">Stock disponible: {producto.stock}</p>
            <button
              className="btn-agregar"
              onClick={() => {agregarAlCarrito(producto); alert("Producto agregado al carrito");}}
              disabled={producto.stock === 0}
            >
              {producto.stock > 0 ? "Agregar al carrito 🛒" : "Sin stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
