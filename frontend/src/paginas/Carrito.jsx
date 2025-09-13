import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContexto } from "../context/CarritoContexto";
import {
  obtenerProductosGuardados,
  moverProductoAGuardado,
  moverProductoAlCarrito,
  eliminarProductoGuardado
} from "../servicios/apiGuardado";
import "../estilos/Carrito.css";

export default function Carrito() {
  const {
    carrito,
    cambiarCantidad,
    eliminarDelCarrito,
    totalCarrito,
    recargarCarrito,
  } = useContext(CarritoContexto);

  const navigate = useNavigate();
  const [cantidades, setCantidades] = useState({});
  const [actualizando, setActualizando] = useState({});
  const [mostrarGuardados, setMostrarGuardados] = useState(false);
  const [guardados, setGuardados] = useState([]);
  const timeoutRefs = useRef({});

  useEffect(() => {
    recargarCarrito();
    cargarGuardadosInicial();
  }, []);

  useEffect(() => {
    const nuevas = {};
    carrito.forEach((item) => {
      nuevas[item.id_producto] = item.cantidad;
    });
    setCantidades(nuevas);
  }, [carrito]);

  const cargarGuardadosInicial = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const data = await obtenerProductosGuardados(usuario.id_usuario);
      setGuardados(data);
      if (data.length > 0) setMostrarGuardados(true);
    } catch (error) {
      console.error("Error al cargar productos guardados:", error);
    }
  };

  const handleCantidadChange = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCantidades((prev) => ({ ...prev, [id_producto]: nuevaCantidad }));
    setActualizando((prev) => ({ ...prev, [id_producto]: true }));

    if (timeoutRefs.current[id_producto]) {
      clearTimeout(timeoutRefs.current[id_producto]);
    }

    timeoutRefs.current[id_producto] = setTimeout(async () => {
      await cambiarCantidad(id_producto, nuevaCantidad);
      setActualizando((prev) => ({ ...prev, [id_producto]: false }));
    }, 500);
  };

  const cargarGuardados = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const data = await obtenerProductosGuardados(usuario.id_usuario);
      setGuardados(data);
      if (data.length === 0) setMostrarGuardados(false);
    } catch (error) {
      console.error("Error al recargar guardados:", error);
    }
  };

  const moverAGuardado = async (id_producto) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    try {
      await moverProductoAGuardado(id_producto, usuario.id_usuario);
      await recargarCarrito();
      await cargarGuardados();
      setMostrarGuardados(true);
    } catch (error) {
      console.error("Error al mover a guardado:", error);
    }
  };

  const restaurar = async (id_producto) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    try {
      await moverProductoAlCarrito(id_producto, usuario.id_usuario);
      await recargarCarrito();
      await cargarGuardados();
    } catch (error) {
      console.error("Error al restaurar producto:", error);
    }
  };

  const eliminarGuardado = async (id_producto) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    try {
      await eliminarProductoGuardado(id_producto, usuario.id_usuario);
      await cargarGuardados();
    } catch (error) {
      console.error("Error al eliminar guardado:", error);
    }
  };

  return (
    <div className="carrito-container">
      <h2>Carrito de Compras</h2>

      {guardados.length > 0 && (
        <button
          className="btn-ver-guardados"
          onClick={() => {
            if (!mostrarGuardados) cargarGuardados();
            setMostrarGuardados(!mostrarGuardados);
          }}
        >
          {mostrarGuardados ? "Ocultar Guardados" : "Ver Guardados para después"}
        </button>
      )}

      {carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <table className="carrito-tabla">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item) => (
              <tr key={`${item.id_carrito}-${item.id_producto}`}>
                <td>
                  <img
                    src={item.PRODUCTO?.CAMISETum?.imagen_url}
                    alt={item.PRODUCTO?.CAMISETum?.descripcion_camiseta}
                    className="producto-imagen"
                  />
                </td>
                <td>{item.PRODUCTO?.CAMISETum?.descripcion_camiseta}</td>
                <td>S/ {parseFloat(item.PRODUCTO?.precio || 0).toFixed(2)}</td>
                <td>
                  <div className="cantidad-control">
                    <button
                      className="btn-cantidad"
                      onClick={() =>
                        handleCantidadChange(
                          item.id_producto,
                          Math.max(1, cantidades[item.id_producto] - 1)
                        )
                      }
                    >
                      −
                    </button>
                    <input
                      className="input-cantidad"
                      type="number"
                      min="1"
                      value={cantidades[item.id_producto] || 1}
                      onChange={(e) => {
                        const nueva = parseInt(e.target.value);
                        if (!isNaN(nueva)) {
                          handleCantidadChange(item.id_producto, nueva);
                        }
                      }}
                    />
                    <button
                      className="btn-cantidad"
                      onClick={() =>
                        handleCantidadChange(item.id_producto, cantidades[item.id_producto] + 1)
                      }
                    >
                      +
                    </button>
                    {actualizando[item.id_producto] && <span className="spinner"></span>}
                  </div>
                </td>
                <td>S/ {(item.PRODUCTO?.precio * item.cantidad).toFixed(2)}</td>
                <td className="acciones-btns">
                  <button className="btn-guardar" onClick={() => moverAGuardado(item.id_producto)}>
                    Guardar para después
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarDelCarrito(item.id_producto)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {carrito.length > 0 && (
        <div className="carrito-total">
          <h3>Total: S/ {totalCarrito.toFixed(2)}</h3>
          <button className="btn-checkout" onClick={() => navigate("/checkout")}>
            Ir a Pagar
          </button>
        </div>
      )}

      {mostrarGuardados && guardados.length > 0 && (
        <div className="guardados-box">
          <h3>Guardados para después</h3>
          <table className="carrito-tabla">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {guardados.map((item) => (
                <tr key={item.id_producto}>
                  <td>
                    <img
                      src={item.PRODUCTO?.CAMISETum?.imagen_url}
                      alt={item.PRODUCTO?.CAMISETum?.descripcion_camiseta}
                      className="producto-imagen"
                    />
                  </td>
                  <td>{item.PRODUCTO?.CAMISETum?.descripcion_camiseta}</td>
                  <td>S/ {parseFloat(item.PRODUCTO?.precio || 0).toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td className="acciones-btns">
                    <button className="btn-guardar" onClick={() => restaurar(item.id_producto)}>
                      Mover a Carrito
                    </button>
                    <button className="btn-eliminar" onClick={() => eliminarGuardado(item.id_producto)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
