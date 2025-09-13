import { useContext, useEffect, useState } from "react";
import { CarritoContexto } from "../context/CarritoContexto";
import "../estilos/Checkout.css";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { carrito, totalCarrito, recargarCarrito } = useContext(CarritoContexto);
  const navigate = useNavigate();
  const [direccion, setDireccion] = useState({
    direccion: "",
    distrito: "",
    referencia: "",
  });
  const [metodoPago, setMetodoPago] = useState("");
  const [metodoEnvio, setMetodoEnvio] = useState("");
  const [tarjeta, setTarjeta] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    recargarCarrito();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return alert("Debes iniciar sesión");

    if (!direccion.direccion || !direccion.distrito || !direccion.referencia ||
        !metodoPago || !metodoEnvio || carrito.length === 0) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (metodoPago === "tarjeta" && (!tarjeta.numero || !tarjeta.nombre || !tarjeta.vencimiento || !tarjeta.cvv)) {
      setError("Completa todos los campos de la tarjeta.");
      return;
    }

    const body = {
      direccion,
      id_metodo_pago: parseInt(metodoPago),
      id_metodo_envio: parseInt(metodoEnvio),
      items: carrito.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad
      }))
    };

    const res = await fetch("http://localhost:3000/api/orden", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "id_usuario": usuario.id_usuario
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.ok) {
      navigate("/pedido-completado");
    } else {
      setError(data.mensaje || "Error al completar orden");
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout - Finalizar Compra</h2>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <h3>Dirección de Envío</h3>
        <input type="text" placeholder="Dirección" value={direccion.direccion}
          onChange={(e) => setDireccion({ ...direccion, direccion: e.target.value })} required />
        <input type="text" placeholder="Distrito" value={direccion.distrito}
          onChange={(e) => setDireccion({ ...direccion, distrito: e.target.value })} required />
        <input type="text" placeholder="Referencia" value={direccion.referencia}
          onChange={(e) => setDireccion({ ...direccion, referencia: e.target.value })} required />

        <h3>Método de Envío</h3>
        <select onChange={(e) => setMetodoEnvio(e.target.value)} required>
          <option value="">Selecciona envío</option>
          <option value="1">Delivery estándar</option>
          <option value="2">Retiro en tienda</option>
        </select>

        <h3>Método de Pago</h3>
        <select onChange={(e) => setMetodoPago(e.target.value)} required>
          <option value="">Selecciona pago</option>
          <option value="1">Pago con QR</option>
          <option value="2">Tarjeta de crédito</option>
        </select>

        {metodoPago === "1" && (
          <div className="qr-box">
            <p>Escanea el código QR para pagar:</p>
            <img src="/qr-pago-ejemplo.png" alt="Código QR" />
          </div>
        )}

        {metodoPago === "2" && (
          <div className="tarjeta-box">
            <input type="text" placeholder="Número de tarjeta" onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })} required />
            <input type="text" placeholder="Nombre en la tarjeta" onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value })} required />
            <input type="text" placeholder="Vencimiento (MM/AA)" onChange={(e) => setTarjeta({ ...tarjeta, vencimiento: e.target.value })} required />
            <input type="text" placeholder="CVV" onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })} required />
          </div>
        )}

        <h3>Resumen de Productos</h3>
        <ul className="resumen-lista">
          {carrito.map(item => (
            <li key={item.id_producto}>
              {item.PRODUCTO?.CAMISETum?.descripcion_camiseta} x {item.cantidad} - S/ {(item.PRODUCTO?.precio * item.cantidad).toFixed(2)}
            </li>
          ))}
        </ul>

        <h3>Total a pagar: <span>S/ {totalCarrito.toFixed(2)}</span></h3>

        {error && <p className="checkout-error">{error}</p>}

        <button type="submit" className="btn-finalizar">Completar Orden</button>
      </form>
    </div>
  );
}
