import { createContext, useState, useEffect, useContext } from "react";
import {
  obtenerCarrito,
  agregarProductoAlCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito as eliminarProductoDelCarrito
} from "../servicios/apiCarrito";
import { UserContext } from "./UserContext"; 

export const CarritoContexto = createContext(null);

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [guardados, setGuardados] = useState([]);
  const [totalCarrito, setTotalCarrito] = useState(0);

  const { usuario } = useContext(UserContext); 

  useEffect(() => {
    if (usuario && usuario.id_usuario) {
      recargarCarrito();
    } else {
      limpiarCarrito(); 
    }
  }, [usuario]); 

  const recargarCarrito = async () => {
    try {
      const actualizado = await obtenerCarrito(usuario.id_usuario);
      setCarrito(actualizado.carrito || []);
      setGuardados(actualizado.guardados || []);
      setTotalCarrito(actualizado.total || 0);
    } catch (e) {
      console.error("Error al recargar carrito:", e);
    }
  };

  const agregarAlCarrito = async (producto) => {
    try {
      await agregarProductoAlCarrito(usuario.id_usuario, producto.id_producto, 1);
      await recargarCarrito();
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  const cambiarCantidad = async (id_producto, nuevaCantidad) => {
    try {
      const datos = await obtenerCarrito(usuario.id_usuario);
      const carritoID = datos?.id_carrito;
      await actualizarCantidadCarrito(carritoID, id_producto, nuevaCantidad, usuario.id_usuario);
      await recargarCarrito();
    } catch (e) {
      console.error("Error al actualizar cantidad:", e);
    }
  };

  const eliminarDelCarrito = async (id_producto) => {
    try {
      const datos = await obtenerCarrito(usuario.id_usuario);
      const carritoID = datos?.id_carrito;
      await eliminarProductoDelCarrito(carritoID, id_producto, usuario.id_usuario);
      await recargarCarrito();
    } catch (e) {
      console.error("Error al eliminar del carrito:", e);
    }
  };

  const moverProductoAGuardado = async (id_producto) => {
    try {
      await fetch(`http://localhost:3000/api/guardado/mover-guardado/${id_producto}`, {
        method: "PUT",
        headers: { "id_usuario": usuario.id_usuario }
      });
      await recargarCarrito();
    } catch (e) {
      console.error("Error al mover a guardados:", e);
    }
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setGuardados([]);
    setTotalCarrito(0);
  };

  return (
    <CarritoContexto.Provider value={{
      carrito,
      agregarAlCarrito,
      cambiarCantidad,
      eliminarDelCarrito,
      totalCarrito,
      recargarCarrito,
      moverProductoAGuardado,
      limpiarCarrito
    }}>
      {children}
    </CarritoContexto.Provider>
  );
}
